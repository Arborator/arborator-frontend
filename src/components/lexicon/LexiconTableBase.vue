<template>
  <q-table
    v-bind="$attrs"
    ref="table"
    :key="tableKey"
    v-model:selected="table.selected"
    selection="multiple"
    :rows="passedLexiconItems"
    :row-key="(row) => row.key"
    :columns="table.fields"
    :visible-columns="table.visibleColumns"
    card-class="shadow-8"
    table-style="max-height:80vh"
    :rows-per-page-options="[50]"
    :loading="lexiconLoading"
    loading-label="loading"
    :filter="table.filter"
    binary-state-sort
    :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
    :v-model:pagination="table.pagination"
    @row-click="onRowClick"
  >
    <!-- <template v-slot:body-cell="props">
        <td v-if="props.row.changed === 'replace'" style="background: mediumseagreen">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.changed === 'add'" style="background: orange">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.changed === 'delete'" style="background: #f34336">
          {{ props.value }}
        </td>
        <td v-else>{{ props.value }}</td>
      </template> -->
    <!-- <template v-slot:body-selection="scope">
        
      </template> -->
    <template #header-selection="scope">
      <q-checkbox v-model="scope.selected" />
    </template>

    <template #body-selection="scope">
      <q-checkbox v-model="scope.selected" />
    </template>

    <template #body-cell-form="props">
      <q-td key="form" :props="props">
        <span :class="compareWithBefore ? 'added-prop' : ''"> {{ props.row.form }} </span>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <span class="removed-prop">
            <del>
              {{ findOriginalLexiconItem(props.row).form }}
            </del>
          </span>
        </template>
      </q-td>
    </template>

    <template #body-cell-lemma="props">
      <q-td key="lemma" :props="props">
        <span :class="compareWithBefore ? 'added-prop' : ''"> {{ props.row.lemma }} </span>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <span class="removed-prop">
            <del>
              {{ findOriginalLexiconItem(props.row).lemma }}
            </del>
          </span>
        </template>
      </q-td>
    </template>

    <template #body-cell-pos="props">
      <q-td key="pos" :props="props">
        <span :class="compareWithBefore ? 'added-prop' : ''"> {{ props.row.pos }} </span>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <span class="removed-prop">
            <del>
              {{ findOriginalLexiconItem(props.row).pos }}
            </del>
          </span>
        </template>
      </q-td>
    </template>
    <template #body-cell-gloss="props">
      <q-td key="gloss" :props="props">
        <span :class="compareWithBefore ? 'added-prop' : ''"> {{ props.row.gloss }} </span>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <span class="removed-prop">
            <del>
              {{ findOriginalLexiconItem(props.row).gloss }}
            </del>
          </span>
        </template>
      </q-td>
    </template>
    <template #body-cell-features="props">
      <q-td key="features" :props="props">
        <span :class="compareWithBefore ? 'added-prop' : ''"> {{ computeFeatureStringWrapper(props.row.features) }} </span>
        <template v-if="compareWithBefore && lexiconItems.length >= 1">
          <br />
          <span class="removed-prop">
            <del>
              {{ computeFeatureStringWrapper(findOriginalLexiconItem(props.row).features) }}
            </del>
          </span>
        </template>
      </q-td>
    </template>
    <template #body-cell-frequency="props">
      <q-td key="frequency" :props="props">
        {{ props.row.frequency }}
      </q-td>
    </template>

    <template #top-right>
      <div>
        <q-input v-model="table.filter" borderless dense debounce="300" placeholder="Search">
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div>
        <q-btn-group v-if="compareWithBefore" flat>
          <q-btn color="default" flat icon="compare_arrows" @click="getRulesGrew()"><q-tooltip>Generate Grew Rule</q-tooltip></q-btn>
          <q-btn color="default" :disable="table.selected.length === 0" flat icon-right="delete_forever" @click="deleteSelected()"
            ><q-tooltip>Unstage selected lexicon changes</q-tooltip></q-btn
          >
        </q-btn-group>
      </div>
    </template>

    <!-- <template v-slot:body-cell="props">
        <td v-if="props.row.changed === 'replace'" style="background: mediumseagreen">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.changed === 'add'" style="background: orange">
          {{ props.value }}
        </td>
        <td v-else-if="props.row.changed === 'delete'" style="background: #f34336">
          {{ props.value }}
        </td>
        <td v-else>{{ props.value }}</td>
      </template> -->
    <!-- Dynamically inherit slots from parent -->
    <template v-for="slot in parentSlots" #[slot]>
      <slot :name="slot" />
    </template>
  </q-table>
</template>

<script lang="ts">
import { computed } from 'vue';
import { computeFeatureString } from './lexiconHelper';
import { mapActions, mapState } from 'pinia';
import { useLexiconStore } from 'src/pinia/modules/lexicon';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { table_t } from 'src/types/main_types';

interface lexicon_item_t {
  key: string;
}

export default {
  name: 'LexiconTable',
  props: ['passedLexiconItems', 'lexiconLoading', 'compareWithBefore'],
  setup(props, ctx) {
    const parentSlots = computed(() => Object.keys(ctx.slots));

    return { parentSlots };
  },
  data() {
    const table: table_t<lexicon_item_t> = {
      fields: [
        {
          name: 'expand',
          label: 'expand',
          field: 'expand',
          sortable: false,
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
          sortable: false,
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
    };
    return {
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
      // searchDialog: false,
      RulesApplied: false,
      uploadDial: false,
      maximizedUploadToggle: false,
      tsvOK: false,
      download: [],
      uploadLexicon: [],
      CompareDics: false,
      dics: [],
      featTable: {
        form: [],
        pos: [],
        featl: [],
        miscl: [],
        lemma: [],
        gloss: [],
        changed: null,
        columns: [
          {
            name: 'a',
            align: 'center',
            label: 'Attribute',
            field: 'a',
            sortable: true,
            style: 'width: 33%',
          },
          {
            name: 'v',
            label: 'Value',
            field: 'v',
            sortable: true,
          },
          {
            name: 'actions',
            label: 'Actions',
            field: '',
            align: 'center',
            style: 'width: 8%',
          },
        ],
      },
      options: {
        // attribute table dialog specific stuff
        annof: [], // = annotationFeatures from conf!!!
        annofFEATS: {}, // obj version (instead of list)
        annofMISC: {}, // obj version (instead of list)
        splitregex: '',
        relav: [],
        currentoptions: [],
        extendedrel: false,
        lemmaoptions: [{ name: 'Lemma', values: 'String' }],
        catoptions: [],
      },
      table,
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
    ...mapState(useLexiconStore, ['lexiconItems']),
  },
  methods: {
    ...mapActions(useLexiconStore, ['setLexiconModificationItem', 'removeCoupleLexiconItemBeforeAfter']),
    ...mapActions(useGrewSearchStore, ['switch_grew_dialog']),
    computeFeatureStringWrapper(featureObj: any) {
      return computeFeatureString(featureObj);
    },
    onRowClick(evt: Event, row: any) {
      this.setLexiconModificationItem(row);
    },
    findOriginalLexiconItem({ key }: { key: string }) {
      const matchLexiconItem = this.lexiconItems.filter((lexiconItem) => {
        if (lexiconItem.key === key) {
          return true;
        }
        return false;
      })[0];
      return matchLexiconItem;
    },
    deleteSelected() {
      for (const selectedModifiedItem of this.table.selected) {
        this.removeCoupleLexiconItemBeforeAfter(selectedModifiedItem.key);
      }
      this.table.selected = [];
    },
    getRulesGrew() {
      this.switch_grew_dialog(true);
      // TODO : handle grew command generation logic
    },

    // exportLexiconTSV() {
    //   for (let i = 0; i < this.passedLexiconItems.length; i += 1) {
    //     this.download.push(this.passedLexiconItems[i]);
    //   }
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
};
</script>

<style scoped>
.added-prop {
  color: #33aa28;
}

.removed-prop {
  color: #ff0000;
}
</style>
