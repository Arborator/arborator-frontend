<template>
  <q-card style="max-width: 100vw">
    <q-bar class="bg-primary text-white">
      <q-space />
      <div class="text-weight-bold">RelationTables</div>
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section>
      <div class="row q-gutter-lg" style="height: 80vh; width: 90vw">
        <div class="col-2">
          <q-toolbar class="text-center">
            <q-toolbar-title>
              <span class="text-primary text-bold">Select an edge</span>
            </q-toolbar-title>
          </q-toolbar>
          <q-scroll-area visible style="height: 80vh">
            <div>
              <q-input ref="filter" v-model="filter" filled label="filter dependency relations">
                <template #append>
                  <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
                </template>
              </q-input>
              <q-tree
                ref="tree"
                v-model:selected="currentEdge"
                :nodes="relationTree"
                node-key="label"
                :filter="filter"
                default-expand-all
                selected-color="primary"
                @update:selected="getTable($event)"
              />
            </div>

            <!-- <q-list separator>
                        <q-item v-for="e in edgesList" :key="e" clickable v-ripple :active="e === currentEdge" active-class="bg-grey-4 text-primary text-bold">
                            <q-item-section @click="select(e)" >{{e}}</q-item-section>
                        </q-item>
                    </q-list> -->
          </q-scroll-area>
        </div>
        <div v-show="currentEdge.length > 0" class="col-9" :data="getTable">
          <q-toolbar class="text-center">
            <q-toolbar-title>
              <span class="text-primary text-bold">{{
                'Relation Table for "' + currentEdge + '" containing a total of ' + relationsTotal[currentEdge] + ' occurrences'
              }}</span>
            </q-toolbar-title>
          </q-toolbar>
          <!--   hide-bottom no-caps sort-by="sum"   -->
          <q-table
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
                  <!-- </span> -->
                </span>
                <span v-else-if="!Number.isInteger(props.value)">{{ props.value }} </span>

                <!--  -->
                <!-- <q-btn v-else color="primary" :label="Object.keys(props.value).length" @click="showTrees(props.value)" /> -->
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
        :searchscope="tablename"
        :parent-on-show-table="onShowTable"
      ></result-view>
    </q-dialog>
  </q-card>
</template>

<script lang="ts">
import { QTree } from 'quasar';
import ResultView from '../ResultView.vue';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
// import dummydata from '../assets/data.json';
import api from '../../api/backend-api';
import { notifyError } from 'src/utils/notify';

import { defineComponent } from 'vue';
import { grewSearchResult_t } from 'src/api/backend-types';
import { cpuUsage } from 'process';

export default defineComponent({
  components: { ResultView, QTree },
  props: ['edges', 'tableType'],

  data() {
    const resultSearch: grewSearchResult_t = {};
    const relationTree: {label: string, icon: string, children: string[],}[] =[] ;
    return {
      currentEdge: '',
      visuTreeDial: false,
      selectedResults: {},
      relationsTotal: {},
      relationTree,
      filter: '',
      tableName: '',
      edgesList: Object.keys(this.edges).sort(),
      table: {
        rows: [],
        columns: [],
      },
      pagination: {
        sortBy: 'NOUN',
        descending: false,
      },
      resultSearch,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['getProjectConfig']),
  },
  mounted() {
    for (const edge of this.edgesList) {
        const relation = edge
        let node = {label: relation, icon: 'view_module', children: []};
        this.relationTree.push(node)
    
    }
    setTimeout(() => {
      (this.$refs.tree as any).expandAll();
      (this.$refs.filter as HTMLElement).focus();
    }, 500);
  },
  methods: {
    /**
     * Create the table  based on the update event on selected list
     *
     * @param {Event} eve
     * @returns void
     */
    getTable() {
      const keySet = new Set();
      for (const gov of Object.keys(this.edges[this.currentEdge] || {})) {
        keySet.add(gov);
        for (const dep of Object.keys((this.edges[this.currentEdge] || {})[gov])) keySet.add(dep);
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
          var num = (this.edges[this.currentEdge][gov as string] || {})[dep as string] || 0;
          row[dep as string] = num;
          rowSum += num;
          (colSum as any)[dep as string] = (colSum as any)[dep as string] + num || num;
        }
        row['sum'] = rowSum;
        if (rowSum > 0 )  rows.push(row);
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

    /**
     * Set the filter to an empty string
     *
     * @returns void
     */
    resetFilter() {
      this.filter = '';
    },

    /**
     * Show the trees considering the table row props
     *
     * @param {Object} props
     * @returns void
     */
    showTrees(props: any) {
      this.tableName = `${this.currentEdge} relation table`;

      var searchPattern = `pattern { GOV -[${this.currentEdge}]-> DEP; `;
      if (props.col.name != 'sum') searchPattern += `DEP [ExtPos="${props.col.name}"/upos="${props.col.name}"]; `;
      if (props.key != '∑') searchPattern += ` GOV [upos="${props.key}"]; `;
      searchPattern += '}';
      this.onSearch(searchPattern);
    },
    onShowTable(resultSearchDialog: any) {
      console.log(resultSearchDialog);
    },
    onSearch(searchPattern: string) {
      const data = { pattern: searchPattern, userType: this.tableType };
      console.log(this.tableType)
      if (this.$route.params.samplename) {
        api
          .searchSample(this.$route.params.projectname as string, this.$route.params.samplename as string, data)
          .then((response) => {
            this.resultSearch = response.data;
            this.visuTreeDial = true;
          })
          .catch((error) => {
            notifyError({ error });
          });
      } else {
        api
          .searchProject(this.$route.params.projectname as string, data)
          .then((response) => {
            this.resultSearch = response.data;
            this.visuTreeDial = true;
          })
          .catch((error) => {
            notifyError({ error });
          });
      }
    },
    /**
     * Check whether variable s is a String or not
     *
     * @param {*} s
     * @returns {Boolean}
     */
    isString(s: unknown) {
      return typeof s === 'string' || s instanceof String;
    },
  },
});
</script>
