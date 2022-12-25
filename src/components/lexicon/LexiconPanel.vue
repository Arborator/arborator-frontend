<template>
  <div>
    <LexiconModificationDialog />
    <LexiconTableBase
      v-show="lexiconItemsModified.length >= 1"
      title="Modified Lexicon"
      :compare-with-before="true"
      :passed-lexicon-items="lexiconItemsModified"
      :lexicon-loading="false"
      :features="features"
    >
    </LexiconTableBase>
    <LexiconTableBase title="Lexicon" :passed-lexicon-items="lexiconItems" :lexicon-loading="lexiconLoading" :features="features"> </LexiconTableBase>
    <q-dialog v-model="grewDialog" seamless position="right" full-width>
      <template v-if="!(exerciseMode && !isTeacher)">
        <GrewSearch :sentence-count="lexiconItems.length" :sample-id="sampleId" :show-table="grewDialog" />
      </template>
    </q-dialog>

    <q-dialog v-model="uploadDial" :maximized="maximizedUploadToggle" transition-show="fade" transition-hide="fade">
      <q-card style="max-width: 100vw">
        <q-bar>
          <q-space />
          <q-btn dense flat icon="minimize" :disable="!maximizedUploadToggle" @click="maximizedUploadToggle = false">
            <q-tooltip v-if="maximizedUploadToggle" content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[0]') }}</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="crop_square" :disable="maximizedUploadToggle" @click="maximizedUploadToggle = true">
            <q-tooltip v-if="!maximizedUploadToggle" content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[1]') }}</q-tooltip>
          </q-btn>
          <q-btn v-close-popup dense flat icon="close">
            <q-tooltip content-class="bg-white text-primary">{{ $t('projectView.tooltipWindows[2]') }}</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <div class="text-h6 text-blue-grey-8">
            {{ $t('projectView.tooltipSelectValidator') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-file
            v-model="uploadSample.attachment.file"
            label="Pick files"
            outlined
            use-chips
            clearable
            :loading="uploadSample.submitting"
            multiple
            style="max-width: 400px"
          >
            <template #after>
              <q-btn
                color="primary"
                dense
                icon="cloud_upload"
                round
                :loading="uploadSample.submitting"
                :disable="uploadSample.attachment.file === null"
                @click="upload()"
              />
            </template>
          </q-file>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import LexiconTableBase from './LexiconTableBase.vue';
import GrewSearch from '../grewSearch/GrewSearch.vue';
import LexiconModificationDialog from './LexiconModificationDialog.vue';
// import CompareLexicon from './CompareLexicon';
import grewTemplates from '../../assets/grew-templates.json';
import { mapState, mapWritableState } from 'pinia';
import { useLexiconStore } from 'src/pinia/modules/lexicon';
import { useProjectStore } from 'src/pinia/modules/project';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { annotationFeatures_t } from 'src/api/backend-types';

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LexiconPanel',
  components: {
    GrewSearch,
    // CompareLexicon,
    LexiconTableBase,
    LexiconModificationDialog,
  },
  props: ['sampleId','features'],

  data() {
    const annof: Partial<annotationFeatures_t> = {};
    const catoptions: { name: string; values: string[] }[] = [];
    return {
      queries: grewTemplates,
      selected: [],
      openFeatures: false,
      tableExporting: false,
      currentword: null,
      someFeatureChanged: false,
      exporting: false,
      RulesGrew: [],
      currentinfo: null,
      tempfeat: '',
      infotochange: null,
      temp_features: '',
      indexfeat: 0,
      resultSearchDialog: false,
      // grewDialog: false,
      RulesApplied: false,
      uploadDial: false,
      maximizedUploadToggle: false,
      tsvOK: false,
      download: [],
      uploadLexicon: [],
      CompareDics: false,
      dics: [],

      options: {
        // attribute table dialog specific stuff
        annof, // = annotationFeatures from conf!!!
        annofFEATS: {}, // obj version (instead of list)
        annofMISC: {}, // obj version (instead of list)
        splitregex: '',
        relav: [],
        currentoptions: [],
        extendedrel: false,
        lemmaoptions: [{ name: 'Lemma', values: 'String' }],
        catoptions,
      },
      table: {
        columns: [
          {
            name: 'expand',
            label: 'expand',
            field: 'expand',
          },
          {
            name: 'form',
            label: 'Form',
            sortable: true,
            align: 'left',
            field: 'form',
          },
          {
            name: 'lemma',
            label: 'Lemma',
            sortable: true,
            align: 'left',
            field: 'lemma',
          },
          {
            name: 'pos',
            label: 'POS',
            sortable: true,
            align: 'left',
            field: 'pos',
          },
          {
            name: 'features',
            label: 'Features',
            align: 'left',
            field: 'features',
          },
          {
            name: 'gloss',
            label: 'Gloss',
            sortable: true,
            align: 'left',
            field: 'gloss',
          },
          {
            name: 'frequency',
            label: 'Frequency',
            sortable: true,
            align: 'left',
            field: 'frequency',
          },
        ],
        visibleColumns: ['form', 'lemma', 'pos', 'features', 'gloss', 'frequency'],
        filter: '',
        selected: [],
        loading: false,
        pagination: {
          sortBy: 'name',
          descending: false,
          page: 1,
          rowsPerPage: 10,
        },
        loadingDelete: false,
        exporting: false,
      },
      alerts: {
        noRuletoApply: { color: 'negative', message: 'No rule to apply' },
        noModification: { color: 'negative', message: 'No modification' },
        getRulegrewSuccess: { color: 'positive', message: 'got rule grew.' },
        onlyOneFile: { color: 'negative', message: 'One file is expected' },
        onlyTSVFile: { color: 'negative', message: 'TSV file is expected' },
      },
      uploadSample: {
        submitting: false,
        attachment: { name: null, file: null },
      },
      tableKey: 0,
    };
  },
  computed: {
    ...mapState(useLexiconStore, ['lexiconItems', 'lexiconLoading', 'lexiconItemsModified']),
    ...mapState(useProjectStore, ['annotationFeatures']),
    ...mapState(useProjectStore, ['isTeacher', 'exerciseMode']),
    ...mapWritableState(useGrewSearchStore, ['grewDialog']),
    // grewDialog: {
    //   get() {
    //     return this.$store.getters['grewSearch/grewDialog'];
    //   },
    //   set(value) {
    //     this.$store.dispatch('grewSearch/switch_grew_dialog', value);
    //   },
    // },
  },
  mounted() {
    this.options.annof = this.annotationFeatures;
    this.options.catoptions.push({
      name: 'POS',
      values: this.options.annof.UPOS as string[],
    });
  },
  methods: {
    upload() {
      console.log('DEPRECATED FUNCTION, FIXME');
      //   const form = new FormData();
      //   this.uploadSample.submitting = true;
      //   if (this.uploadSample.attachment.file.length === 1) {
      //     for (const file of this.uploadSample.attachment.file) {
      //       form.append('files', file);
      //       if (file.type === ('text/tab-separated-values' || 'tsv')) {
      //         this.tsvOK = true;
      //       }
      //     }
      //     if (this.tsvOK === true) {
      //       api
      //         .uploadValidator(this.$route.params.projectname, form)
      //         .then((response) => {
      //           this.uploadSample.attachment.file = [];
      //           this.uploadDial = false;
      //           this.addValidator(response.data.validator);
      //           this.uploadSample.submitting = false;
      //         })
      //         .catch((error) => {
      //           if (error.response) {
      //             error.response.message = error.response.data.message;
      //             error.permanent = true;
      //           }
      //           error.caption = 'Check your file please!';
      //           this.uploadSample.submitting = false;
      //           this.uploadDial = false;
      //           notifyError({ error });
      //         });
      //       this.tsvOK = false;
      //     } else {
      //     }
      //     const datasample = { data: this.RulesGrew };
      //     api.transformation_grew(this.$route.params.projectname, datasample).then((response) => {
      //       if (this.queries.slice(-1)[0].name !== 'Correct lexicon') {
      //         this.queries.push({
      //           name: 'Correct lexicon',
      //           pattern: response.data.rules,
      //           commands: ' ',
      //           sampleIds: listSampleIds,
      //         });
      //       } else {
      //         this.queries.slice(-1)[0].pattern = response.data.rules;
      //         this.queries.slice(-1)[0].commands = ' ';
      //         this.queries.slice(-1)[0].sampleIds = listSampleIds;
      //       }
      //     });
      //     this.grewDialog = true;
      //   } else {
      //   const datasample = { data: this.download };
      //   api
      //     .exportLexiconTSV(this.$route.params.projectname, datasample)
      //     .then((response) => {
      //       const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/tab-separated-values' }));
      //       const link = document.createElement('a');
      //       link.href = url;
      //       link.setAttribute('download', `lexicon_${this.$route.params.projectname}.tsv`);
      //       document.body.appendChild(link);
      //       link.click();
      //       document.body.removeChild(link);
      //       this.table.exporting = false;
      //       notifyMessage({ message: 'File downloaded' });
      //       return [];
      //     })
      //     .catch((error) => {
      //       // notifyMessage({message:`${error}`, color:'negative'});
      //       notifyError({ error });
      //       return [];
      //     });
      //   this.download = [];
      // },
      // exportLexiconJSON() {
      //   for (let i = 0; i < this.lexiconItems.length; i += 1) {
      //     if (this.lexiconItems[i].changed !== 'delete') {
      //       if (!('frequency' in this.lexiconItems[i])) {
      //         this.lexiconItems[i].frequency = '_';
      //       }
      //       this.download.push(this.lexiconItems[i]);
      //     }
      //   }
      //   const datasample = { data: this.download };
      //   api
      //     .exportLexiconJSON(this.$route.params.projectname, datasample)
      //     .then((response) => {
      //       const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/json' }));
      //       const link = document.createElement('a');
      //       link.href = url;
      //       link.setAttribute('download', `lexicon_${this.$route.params.projectname}.json`);
      //       document.body.appendChild(link);
      //       link.click();
      //       document.body.removeChild(link);
      //       this.table.exporting = false;
      //       notifyMessage({ message: 'File downloaded' });
      //       return [];
      //     })
      //     .catch((error) => {
      //       // notifyMessage({message:`${error}`, color:'negative'});
      //       notifyError({ error });
      //       return [];
      //     });
      //   this.download = [];
      // },
    },
  },
});
</script>
