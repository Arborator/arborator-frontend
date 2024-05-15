<template>
  <q-card flat bordered>
    <q-table
      v-bind="$attrs"
      ref="table"
      v-model:selected="table.selected"
      v-model:pagination="table.pagination"
      selection="multiple"
      :rows="getLexiconData"
      row-key="key"
      binary-state-sort
      :rows-per-page-options="[50]"
      :columns="table.fields"
      :visible-columns="table.visibleColumns"
      card-class="shadow-8"
      table-style="max-height:80vh"
      :loading="lexiconLoading"
      loading-label="loading"
      :filter="table.filter"
      :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
      @row-click="onRowClick"
    >
      <template #header-selection="scope">
        <q-checkbox v-model="scope.selected" />
      </template>

      <template #body-selection="scope">
        <q-checkbox v-model="scope.selected" />
      </template>

      <template #body-cell="props">
        <q-td :props="props">
          <span :class="compareWithBefore && passedLexiconItems.length >= 1 ? 'added-prop' : ''"> {{ props.value }} </span>
          <template v-if="compareWithBefore">
            <br />
            <span class="removed-prop">
              <del>
                {{ findOriginalLexiconItem(props).feats[props.col.field] }}
              </del>
            </span>
          </template>
        </q-td>
      </template>
      <template #body-cell-frequency="props">
        <q-td key="frequency" :props="props">
          <q-btn dense color="secondary" outline :label="props.row.frequency" @click.stop="showTrees(props.row)" />
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
        <q-btn color="default" flat label="tsv" @click="exportLexiconTSV">
          <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('lexicon.tooltipExportLexicon[0]') }}</q-tooltip>
        </q-btn>
        <q-btn color="default" flat label="json" @click="exportLexiconJSON">
          <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('lexicon.tooltipExportLexicon[1]') }} </q-tooltip>
        </q-btn>
        <div>
          <q-btn-group v-if="compareWithBefore" flat>
            <q-btn color="default" :disable="table.selected.length === 0" flat icon="compare_arrows" @click="get()">
              <q-tooltip>{{ $t('lexicon.tooltipRuleGrewLexicon') }}</q-tooltip>
            </q-btn>
            <q-btn color="default" :disable="table.selected.length === 0" flat icon-right="delete_forever" @click="deleteSelected()">
              <q-tooltip>{{ $t('lexicon.tooltipUnstageModifiedItem') }}</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>
      </template>

      <!-- Dynamically inherit slots from parent -->
      <template v-for="slot in parentSlots" #[slot]>
        <slot :name="slot" />
      </template>
    </q-table>
    <q-card-section>
      <q-dialog v-model="visuTreeDial" maximized transition-show="fade" transition-hide="fade">
        <ResultView :searchResults="resultSearch"></ResultView>
      </q-dialog>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import api from '../../api/backend-api';
import ResultView from '../grewSearch/ResultView.vue';

import { mapActions, mapState } from 'pinia';
import { lexiconItem_FE_t, useLexiconStore } from 'src/pinia/modules/lexicon';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { notifyError, notifyMessage } from 'src/utils/notify';

import { table_t } from 'src/types/main_types';
import { grewSearchResult_t } from 'src/api/backend-types';

import { defineComponent, PropType, computed } from 'vue';

export default defineComponent({
  name: 'LexiconTable',
  props: {
    passedLexiconItems: {
      type: Object as PropType<lexiconItem_FE_t[]>,
      required: true,
    },
    lexiconLoading: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    compareWithBefore: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    features: {
      type: Object as PropType<string[]>,
      required: true,
    },
    lexiconType: {
      type: String as PropType<string>,
      required: true,
    },
    sampleIds: {
      type: Object as PropType<string[]>,
      required: true,
    },
  },
  components: { ResultView },
  setup(props, ctx) {
    const parentSlots = computed(() => Object.keys(ctx.slots));

    return { parentSlots };
  },
  data() {
    const resultSearch: grewSearchResult_t = {};
    const lexiconData: {}[] = [];
    const table: table_t<lexiconItem_FE_t> = {
      fields: [],
      visibleColumns: [],
      filter: '',
      selected: [],
      loading: false,
      pagination: {
        sortBy: 'key',
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
      loadingDelete: false,
      exporting: false,
    };
    return {
      resultSearch,
      visuTreeDial: false,
      lexiconData,
      download: [],
      table,
      tableKey: 0,
    };
  },
  mounted() {
    this.createTableFieldsAndColumns();
  },
  computed: {
    ...mapState(useLexiconStore, ['lexiconItems']),

    getLexiconData() {
      this.lexiconData = [];
      for (const lexiconItem of this.passedLexiconItems) {
        this.lexiconData.push({ ...lexiconItem.feats, key: lexiconItem.key, frequency: lexiconItem.freq });
      }
      return this.lexiconData;
    },

    projectName() {
      return this.$route.params.projectname;
    },
  },
  methods: {
    ...mapActions(useLexiconStore, ['setLexiconModificationItem', 'removeCoupleLexiconItemBeforeAfter']),
    ...mapActions(useGrewSearchStore, ['switchGrewDialog', 'changeLastGrewQuery']),

    createTableFieldsAndColumns() {
      for (const feature of this.features) {
        this.table.fields.push({
          name: feature,
          label: feature.charAt(0).toUpperCase() + feature.slice(1),
          sortable: true,
          align: 'left',
          field: feature,
        });
        this.table.visibleColumns.push(feature);
      }
      this.table.fields.push({
        name: 'frequency',
        label: 'Frequency',
        sortable: true,
        align: 'left',
        field: 'frequency',
      });
      this.table.visibleColumns.push('frequency');
    },

    onRowClick(evt: Event, row: any) {
      this.setLexiconModificationItem(this.findOriginalLexiconItem(row));
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

    get() {
      let grewRuleConcatenated = '';
      let counter = 1;

      for (const after of this.table.selected) {
        const before = this.findOriginalLexiconItem(after);
        const thisRule = this.grewRuleFromLexiconItemPair(before, after);
        grewRuleConcatenated += `rule r${counter} {\n${thisRule}\n}\n`;
        counter = counter + 1;
      }
      this.changeLastGrewQuery({ text: grewRuleConcatenated, type: 'REWRITE', userType: this.lexiconType });
      this.switchGrewDialog(true);
    },

    grewPatternFromLexiconItem(lex_item: lexiconItem_FE_t) {
      let pattern = 'pattern { N[';
      for (const [feat, value] of Object.entries(lex_item.feats)) {
        if (feat && value) {
          pattern += `${feat} = "${value}", `;
        } else {
          pattern += `!${feat}, `;
        }
      }
      pattern += '] }';
      return pattern;
    },

    grewRuleFromLexiconItemPair(before: lexiconItem_FE_t, after: any) {
      let commands = 'commands { ';
      let withouts = '';
      for (const feat in before.feats) {
        if (before.feats[feat] != after[feat]) {
          if (after[feat]) {
            withouts += `\nwithout { N.${feat} = "${after[feat]}" }`;
            commands += `N.${feat} = "${after[feat]}"; `;
          } else {
            commands += `del_feat N.${feat}; `;
          }
        }
      }
      commands += '}';
      return this.grewPatternFromLexiconItem(before) + withouts + '\n' + commands;
    },

    showTrees(row: any) {
      this.onSearch(this.grewPatternFromLexiconItem(this.findOriginalLexiconItem(row)));
    },

    exportLexiconTSV() {
      const download = [];
      for (const lexiconItem of this.passedLexiconItems) {
        download.push(lexiconItem);
      }
      const datasample = { data: download };
      api
        .exportLexiconTSV(this.projectName as string, datasample)
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/tab-separated-values' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `lexicon_${this.projectName}.tsv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.table.exporting = false;
          notifyMessage({ message: 'File downloaded' });
          return [];
        })
        .catch((error) => {
          notifyError({ error });
          return [];
        });
    },

    exportLexiconJSON() {
      const download = [];
      for (const lexiconItem of this.passedLexiconItems) {
        download.push(lexiconItem);
      }
      const datasample = { data: download };
      api
        .exportLexiconJSON(this.projectName as string, datasample)
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/json' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `lexicon_${this.projectName}.json`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.table.exporting = false;
          notifyMessage({ message: 'File downloaded' });
          return [];
        })
        .catch((error) => {
          notifyError({ error });
          return [];
        });
      this.download = [];
    },

    onSearch(searchPattern: string) {
      const data = { pattern: searchPattern, userType: this.lexiconType, sampleIds: this.sampleIds };
      api
        .searchRequest(this.projectName as string, data)
        .then((response) => {
          this.resultSearch = response.data;
          this.visuTreeDial = true;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
  },
});
</script>

<style>
.added-prop {
  color: #33aa28;
}

.removed-prop {
  color: #ff0000;
}
.my-sticky-header-table th {
  background-color: white;
}
.my-sticky-header-table-dark th {
  background-color: #121212;
}
</style>
