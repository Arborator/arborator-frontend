<template>
  <q-card style="max-width: 100vw">
    <q-bar class="bg-primary text-white sticky-bar">
      <q-space />
      <div class="text-weight-bold">RelationTables</div>
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>

    <q-card-section>
      <q-select 
        dense 
        outlined 
        v-model="treeType" 
        :options="treeOptions" 
        :label="$t('grewSearch.treesType')"
        @update:model-value="getRelationTable()"
      >
        <template v-slot:selected-item="scope">
        
          <q-chip
            v-if="scope.opt.value == 'user' || scope.opt.value == 'user_recent'"
            dense
            square
            color="white"
            text-color="primary"
            size="md"
          >
            <q-avatar>
              <img :src="avatar" />
              <q-badge v-if="scope.opt.value == 'user_recent'" floating transparent>+</q-badge>
            </q-avatar>
            {{ scope.opt.label }}
          </q-chip>
          <q-chip v-else dense square color="white" text-color="primary" size="md" :label="scope.opt.label" :icon="scope.opt.icon" />
        </template>

        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-avatar v-if="scope.opt.value == 'user' || scope.opt.value == 'user_recent'" size="1.2rem">
                <img :src="avatar" />
                <q-badge v-if="scope.opt.value == 'user_recent'" floating transparent color="principal">+</q-badge>
              </q-avatar>
              <q-icon v-else :name="scope.opt.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </q-card-section>

    <q-card-section>
      <div class="row q-gutter-lg" style="height: 80vh; width: 90vw">
        <div class="col-2">
          <q-toolbar class="text-center">
            <q-toolbar-title>
              <span class="text-primary text-bold">Select an edge</span>
            </q-toolbar-title>
          </q-toolbar>
          <q-input 
            outlined 
            dense 
            ref="filter" 
            v-model="filter" 
            label="filter dependency relations"
          >
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
              <span class="text-primary text-bold">{{
                'Relation Table for "' + currentEdge + '" containing a total of ' + relationsTotal[currentEdge] + ' occurrences'
              }}</span>
            </q-toolbar-title>
          </q-toolbar>
          <q-table
            flat
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
      <result-view
        :searchresults="resultSearch"
        :totalsents="relationsTotal[currentEdge]"
        :searchscope="tableName"
        :parent-on-show-table="onShowTable"
      ></result-view>
    </q-dialog>
  </q-card>
</template>

<script lang="ts">
import ResultView from '../ResultView.vue';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';

import api from '../../api/backend-api';
import { notifyError } from 'src/utils/notify';

import { defineComponent, PropType } from 'vue';
import { grewSearchResult_t } from 'src/api/backend-types';


export default defineComponent({
  components: { ResultView },
  props: {
    sampleNames: {
      type: Object as PropType<string[]>,
      default: [],
    }
  },
  data() {
    const resultSearch: grewSearchResult_t = {};
    const relationTree: { label: string; icon: string; children: string[] }[] = [];
    const treeTypes = [
      { value: 'user', label: this.$t('projectView.tooltipFabGrewUser') },
      { value: 'user_recent', label: this.$t('projectView.tooltipFabGrewUserRecent') },
      { value: 'recent', label: this.$t('projectView.tooltipFabGrewRecent'), icon: 'schedule' },
      { value: 'all', label: this.$t('projectView.tooltipFabGrewAll'), icon: 'groups' },
    ];
    const treeType = treeTypes[0];
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
      treeTypes,
      treeType,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['getProjectConfig', 'canSaveTreeInProject', ]),
    ...mapState(useUserStore, ['avatar']),
    treeOptions(){
      if(!this.canSaveTreeInProject){
        return this.treeTypes.slice(2);
      }
      return this.treeTypes;
    }
  },
  mounted() {
    this.getRelationTable();
    setTimeout(() => {
      (this.$refs.tree as any).expandAll();
      (this.$refs.filter as HTMLElement).focus();
    }, 500);
  },
  methods: {
    getRelationTable(){
      let edgesList = [];
      this.relationTree = [];
      const data = { sampleIds: this.sampleNames, tableType: this.treeType.value };
      api
        .getRelationTable(this.$route.params.projectname as string, data)
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
      const currentEdges = (this.relationTableInfos as any)[this.currentEdge] || {}
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
      var colSum = {};

      for (const gov of keySet) {
        const row = { gov } as any;
        var rowSum = 0;

        for (const dep of keySet) {
          var num = (currentEdges[gov as string] || {})[dep as string] || 0;
          row[dep as string] = num;
          rowSum += num;
          (colSum as any)[dep as string] = (colSum as any)[dep as string] + num || num;
        }
        row['sum'] = rowSum;
        if (rowSum > 0)  rows.push(row);
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
      var searchPattern = `pattern { GOV -[${this.currentEdge}]-> DEP; `;
      if (props.col.name != 'sum') searchPattern += `DEP [ExtPos="${props.col.name}"/upos="${props.col.name}"]; `;
      if (props.key != '∑' && props.key != '_') searchPattern += ` GOV [upos="${props.key}"]; `;
      searchPattern += '}';
      this.onSearch(searchPattern);
    },
    onShowTable(resultSearchDialog: any) {
      console.log(resultSearchDialog);
    },
    onSearch(searchPattern: string) {
      const data = { pattern: searchPattern, userType: this.treeType.value, sampleIds: this.sampleNames };
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
