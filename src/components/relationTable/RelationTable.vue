<template>
  <q-card flat bordered>
    <q-card-section class="q-gutter-md row">
      <div class="col-8">
        <TreesTypeSelect :grew-option="'relation_table'" :samples="samples" @selected-value="getSelectedValues"></TreesTypeSelect>
      </div>
      <div class="col">
        <q-btn :disable="!isOwner && freezed" no-caps color="primary" :label="$t('relationTable.generateTable')" @click="getRelationTable()" />
      </div>
    </q-card-section>
    <q-card-section>
      <div class="row q-gutter-lg">
        <div class="col-2">
          <q-toolbar class="text-center">
            <q-toolbar-title>
              <span class="text-primary text-bold">{{ $t('relationTable.selectEdge') }}</span>
            </q-toolbar-title>
          </q-toolbar>
          <q-input outlined dense ref="filter" v-model="filter" :label="$t('relationTable.filterRelations')">
            <template #append>
              <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
            </template>
          </q-input>
          <q-scroll-area visible style="height: 80vh">
            <div>
              <q-tree
                ref="tree"
                v-model:selected="currentEdge"
                :nodes="relationTree"
                node-key="label"
                :filter="filter"
                default-expand-all
                selected-color="primary"
                @update:selected="displayTable($event)"
              />
            </div>
          </q-scroll-area>
        </div>
        <q-separator vertical inset />
        <div v-show="currentEdge.length > 0" class="col-9" :data="displayTable">
          <q-toolbar class="text-center">
            <q-toolbar-title>
              <span class="text-primary text-bold">
                {{ 'Relation Table for "' + currentEdge + '" containing a total of ' + relationsTotal[currentEdge] + ' occurrences' }}
              </span>
            </q-toolbar-title>
          </q-toolbar>
          <q-table
            flat
            bordered
            ref="relationTable"
            v-model:pagination="pagination"
            class="rounded-borders"
            :rows="table.rows"
            :columns="table.columns"
            row-key="gov"
            :rows-per-page-options="[0]"
            hide-bottom
          >
            <template #body-cell="props">
              <q-td :props="props">
                <span v-if="props.value > 0">
                  <q-btn
                    v-if="props.key == '∑' || props.col.name == 'sum'"
                    dense
                    color="secondary"
                    outline
                    :label="props.value"
                    @click="showTrees(props)"
                  />
                  <q-btn v-else dense color="primary" outline :label="props.value" @click="showTrees(props)" />
                </span>
                <span v-else-if="!Number.isInteger(props.value)">{{ props.value }} </span>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
    </q-card-section>
    <q-dialog v-model="visuTreeDial" maximized transition-show="fade" transition-hide="fade">
      <ResultView :searchResults="resultSearch" @closed="visuTreeDial = false"  />
    </q-dialog>
  </q-card>
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { grewSearchResult_t, sample_t } from 'src/api/backend-types';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import api from '../../api/backend-api';
import ResultView from '../grewSearch/ResultView.vue';
import TreesTypeSelect from '../shared/TreesTypeSelect.vue';

export default defineComponent({
  components: { ResultView, TreesTypeSelect },
  props: {
    samples: {
      type: Object as PropType<sample_t[]>,
      required: true,
    },
   
  },
  data() {
    const resultSearch: grewSearchResult_t = {};
    const relationTree: { label: string; icon: string; children: string[] }[] = [];
    const data: { selectedSamples: string[]; treeType: string; otherUser: string } = { selectedSamples: [], treeType: 'recent', otherUser: '' };
    return {
      currentEdge: '',
      visuTreeDial: false,
      relationsTotal: {},
      relationTree,
      filter: '',
      tableName: '',
      relationTableInfos: {},
      table: {
        rows: [],
        columns: [],
      },
      pagination: {
        sortBy: 'NOUN',
        descending: false,
      },
      resultSearch,
      data,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['name', 'freezed', 'isOwner']),
  },
  mounted() {
    setTimeout(() => {
      (this.$refs.tree as any).expandAll();
      (this.$refs.filter as HTMLElement).focus();
    }, 500);
  },
  methods: {
    getSelectedValues(val: any) {
      this.data = val;
    },
    getRelationTable() {
      let edgesList = [];
      this.relationTree = [];
      const data = { sampleIds: this.data.selectedSamples, tableType: this.data.treeType };
      api
        .getRelationTable(this.name, data)
        .then((response) => {
          this.relationTableInfos = response.data;
          edgesList = Object.keys(this.relationTableInfos).sort();
          for (const edge of edgesList) {
            const relation = edge;
            let node = { label: relation, icon: 'view_module', children: [] };
            this.relationTree.push(node);
          }
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    displayTable() {
      const keySet = new Set();
      const currentEdges = (this.relationTableInfos as any)[this.currentEdge] || {};
      for (const gov of Object.keys(currentEdges)) {
        keySet.add(gov);
        for (const dep of Object.keys(currentEdges[gov])) {
          keySet.add(dep);
        }
      }
      const fields: any[] = [];
      for (const key of keySet) {
        (fields as any).push({
          name: key,
          align: 'center',
          label: key,
          field: key,
          sortable: true,
          sum: 0,
        });
      }

      (this.relationsTotal as any)[this.currentEdge] = 0;
      // construct rows
      const rows = [];
      let colSum = {};

      for (const gov of keySet) {
        const row = { gov } as any;
        let rowSum = 0;

        for (const dep of keySet) {
          let num = (currentEdges[gov as string] || {})[dep as string] || 0;
          row[dep as string] = num;
          rowSum += num;
          (colSum as any)[dep as string] = (colSum as any)[dep as string] + num || num;
        }
        row['sum'] = rowSum;
        if (rowSum > 0) rows.push(row);
        (this.relationsTotal as any)[this.currentEdge] += rowSum;
      }
      (colSum as any)['sum'] = Object.values(colSum).reduce((sum, value) => (sum as number) + (value as number), 0);
      (colSum as any)['gov'] = '∑';

      rows.unshift(colSum);
      fields.sort((a, b) => ((colSum as any)[a.name as string] > (colSum as any)[b.name] ? -1 : 1));
      fields.unshift({ name: 'sum', label: '∑', field: (row: any) => row.sum, sortable: true, sum: 0 });
      fields.unshift({ name: 'gov', label: '↗', field: (row: any) => row.gov, sortable: true, sum: 0 });
      this.table.columns = fields as any;
      this.table.rows = rows as any;
      this.pagination = {
        sortBy: 'sum',
        descending: true,
      };
    },
    resetFilter() {
      this.filter = '';
    },
    showTrees(props: any) {
      this.tableName = `${this.currentEdge} relation table`;
      let searchPattern = ''
      if (this.currentEdge === '_') {
        searchPattern = `pattern { e: GOV -> DEP;  e.label = "_"; `
      }
      else {
        searchPattern = `pattern { GOV -["${this.currentEdge}"]-> DEP; `;
      }
      if (props.col.name != 'sum') searchPattern += `DEP [ExtPos="${props.col.name}"/upos="${props.col.name}"]; `;
      if (props.key != '∑' && props.key != '_') searchPattern += ` GOV [upos="${props.key}"]; `;
      searchPattern += '}';
      this.onSearch(searchPattern);
    },
    onSearch(searchPattern: string) {
      const data = { pattern: searchPattern, userType: this.data.treeType, sampleIds: this.data.selectedSamples };
      api
        .searchRequest(this.$route.params.projectname as string, data)
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
