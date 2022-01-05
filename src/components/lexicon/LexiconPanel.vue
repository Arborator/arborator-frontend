<template>
  <div>
    <LexiconModificationDialog />
    <LexiconTableBase
      v-show="lexiconItemsModified.length >= 1"
      title="Modified Lexicon"
      :compare-with-before="true"
      :passed-lexicon-items="lexiconItemsModified"
      :lexicon-loading="false"
    >
    </LexiconTableBase>
    <LexiconTableBase title="Lexicon" :passed-lexicon-items="lexiconItems" :lexicon-loading="lexiconLoading"> </LexiconTableBase>

    <!-- <q-table
      ref="table"
      title="Lexicon"
      v-model:selected="table.selected"
      selection="multiple"
      :rows="lexiconItems"
      :row-key="(row) => `${row.form}-${row.lemma}-${row.gloss}-${row.pos}`"
      :columns="table.columns"
      :visible-columns="table.visibleColumns"
      @row-click="onRowClick"
      card-class="shadow-8"
      :key="tableKey"
      table-style="max-height:80vh"
      :rows-per-page-options="[50]"
      :loading="lexiconLoading"
      loading-label="loading"
      :filter="table.filter"
      binary-state-sort
      :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
      :v-model:pagination="table.pagination"
    >


      <template v-slot:top-right>
        <div>
          <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div>
          <q-btn-group compareWithBefore flat>
            <q-btn color="default" v-show="table.selected.length < 1" flat icon="delete_forever" disable
              ><q-tooltip>Delete seleted samples</q-tooltip></q-btn
            >
            <q-btn color="default" flat label="tsv" @click="exportLexiconTSV()" :loading="tableExporting"
              ><q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipExportLexicon[0]') }}</q-tooltip></q-btn
            >
            <q-btn color="default" flat label="json" @click="exportLexiconJSON()" :loading="tableExporting"
              ><q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipExportLexicon[1]') }}</q-tooltip></q-btn
            >
            <q-btn color="default" flat label="Rule Grew" @click="getRulesGrew()" :disable="RulesGrew.length < 0"
              ><q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipRuleGrewLexicon') }}</q-tooltip></q-btn
            >
            <q-btn flat color="default" v-show="CompareDics === false" icon="cloud_upload" @click="uploadDial = true"
              ><q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipValidatorLexicon') }}</q-tooltip></q-btn
            >
            <q-btn flat color="default" v-show="CompareDics === true" icon="cloud_upload" @click="CompareDics = false"
              ><q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipValidatorLexicon') }}</q-tooltip></q-btn
            >
          </q-btn-group>
        </div>
      </template>
    </q-table> -->
    <!-- <div v-show="CompareDics === true">
      <q-space />
      <q-card>
        <q-separator />
        <CompareLexicon :data="this.dics" :sampleId="this.sampleId"> </CompareLexicon>
      </q-card>
    </div> -->
    <!-- <q-dialog v-model="openFeatures">
      <q-card>
        <q-bar class="bg-primary text-white">
          <div class="text-weight-bold">Features of "{{ currentword }}"</div>
          <q-space />
          <q-btn flat dense icon="close" v-close-popup />
        </q-bar>
        <attribute-table
          :featdata="featTable.form"
          :columns="featTable.columns"
          openFeatures="false"
          modifiable="false"
          title="Form"
          :featOptions="['String']"
          @feature-changed="informFeatureChanged()"
        />
        <q-separator />
        <attribute-table
          :featdata="featTable.lemma"
          :columns="featTable.columns"
          openFeatures="false"
          modifiable="false"
          title="Lemma"
          :featOptions="options.lemmaoptions"
          @feature-changed="informFeatureChanged()"
        />
        <attribute-table
          :featdata="featTable.pos"
          :columns="featTable.columns"
          openFeatures="false"
          modifiable="false"
          title="Category"
          :featOptions="options.catoptions"
          @feature-changed="informFeatureChanged()"
        />
        <attribute-table
          :featdata="featTable.featl"
          :columns="featTable.columns"
          openFeatures="false"
          modifiable="true"
          title="Universal Features"
          :featOptions="options.annof.FEATS"
          @feature-changed="informFeatureChanged()"
        />
        <attribute-table
          :featdata="featTable.gloss"
          :columns="featTable.columns"
          openFeatures="false"
          modifiable="false"
          title="Gloss"
          :featOptions="['String']"
          @feature-changed="informFeatureChanged()"
        />
        <q-separator />
        <q-card-actions align="around">
          <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup style="width: 35%; margin-left: auto; margin-right: auto" />
          <q-btn flat @click="addEntry()" label="Add entry" v-close-popup style="width: 45%; margin-left: auto; margin-right: auto" />
          <q-btn
            v-if="featTable.changed !== 'add'"
            color="primary"
            @click="replaceEntry()"
            :loading="exporting"
            label="Replace entry"
            v-close-popup
            style="width: 45%; margin-left: auto; margin-right: auto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog> -->
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

export default {
  name: 'LexiconTable',
  components: {
    GrewSearch,
    // CompareLexicon,
    LexiconTableBase,
    LexiconModificationDialog,
  },
  props: ['sampleId'],

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
    ...mapState(useLexiconStore, ['isShowLexiconPanel', 'lexiconItems', 'lexiconLoading', 'lexiconItemsModified']),
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
      //       this.$q.notify({ message: 'File downloaded' });
      //       return [];
      //     })
      //     .catch((error) => {
      //       // this.$q.notify({message:`${error}`, color:'negative'});
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
      //       this.$q.notify({ message: 'File downloaded' });
      //       return [];
      //     })
      //     .catch((error) => {
      //       // this.$q.notify({message:`${error}`, color:'negative'});
      //       notifyError({ error });
      //       return [];
      //     });
      //   this.download = [];
      // },
    },
  },
};
</script>
