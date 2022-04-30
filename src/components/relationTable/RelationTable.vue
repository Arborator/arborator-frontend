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
                :nodes="relationtree"
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
                'Relation Table for "' + currentEdge + '" containing a total of ' + relationstotal[currentEdge] + ' occurrences'
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
        :totalsents="relationstotal[currentEdge]"
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

export default defineComponent({
  components: { ResultView, QTree },
  props: ['edges'],

  data() {
    const resultSearch: grewSearchResult_t = {};
    return {
      currentEdge: '',
      visuTreeDial: false,
      selectedResults: {},
      relationstotal: {},
      relationtree: [],
      filter: '',
      tablename: '',
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
    // sentenceCount() {return 17}, // todo get the total number of sentences in the table
  },
  mounted() {
    const splitters = this.getProjectConfig.annotationFeatures.DEPREL.map(({ join }) => join).join('');
    const splitregex = new RegExp(`[${splitters}]`, 'g'); // = /[:@]/g

    this.relationtree = [];
    let lasta = this.relationtree;
    let match;
    let newo;
    for (const edge of this.edgesList) {
      match = splitregex.exec(edge + splitters[0]);
      if (match) {
        const r = edge.substr(0, match.index);
        const alr = lasta.filter((rr) => (rr as any).label === r);
        if (alr.length === 0) {
          newo = { label: r, children: [] };
          (newo as any).selectable = r === edge; // some labels don't exist without children
          (newo as any).icon = r === edge ? 'view_module' : null;
          (lasta as any).push(newo as unknown as any);
        } else [newo] = alr;
        lasta = newo.children;
      }
      lasta = this.relationtree;
    }
    // this.$refs.tree.expandAll(); // doesn't seem to work without timeout
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
      const keyset = new Set();
      for (const gov of Object.keys(this.edges[this.currentEdge] || {})) {
        keyset.add(gov);
        for (const dep of Object.keys((this.edges[this.currentEdge] || {})[gov])) keyset.add(dep);
      }
      // construct fields
      const fields: any[] = [];
      for (const key of keyset) {
        (fields as any).push({
          name: key,
          align: 'center',
          label: key,
          field: key,
          sortable: true,
          sum: 0,
        });
      }

      (this.relationstotal as any)[this.currentEdge] = 0;
      // construct rows
      const rows = [];
      var colsum = {};
      for (const gov of keyset) {
        const row = { gov } as any;
        var rowsum = 0;
        for (const dep of keyset) {
          var num = (this.edges[this.currentEdge][gov as string] || {})[dep as string] || 0;
          row[dep as string] = num;
          rowsum += num;
          (colsum as any)[dep as string] = (colsum as any)[dep as string] + num || num;
        }
        row['sum'] = rowsum;
        rows.push(row);
        (this.relationstotal as any)[this.currentEdge] += rowsum;
      }
      (colsum as any)['sum'] = Object.values(colsum).reduce((sum, value) => (sum as number) + (value as number), 0);
      (colsum as any)['gov'] = '∑';

      rows.unshift(colsum);
      fields.sort((a, b) => ((colsum as any)[a.name as string] > (colsum as any)[b.name] ? -1 : 1));
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
      this.tablename = `${this.currentEdge} relation table`;

      var searchPattern = `pattern { GOV -[${this.currentEdge}]-> DEP; `;
      if (props.col.name != 'sum') searchPattern += `DEP [ExtPos="${props.col.name}"/upos="${props.col.name}"]; `;
      if (props.key != '∑') searchPattern += ` GOV [upos="${props.key}"]; `;
      searchPattern += '}';
      this.onSearch(searchPattern);
    },
    onShowTable(resultSearchDialog: any) {
      // never called?
      console.log(555555, resultSearchDialog);
      // this.resultSearchDialog = resultSearchDialog;
      // this.grewDialog = false;
    },
    onSearch(searchPattern: string) {
      const query = { pattern: searchPattern };
      if (this.$route.params.samplename) {
        api
          .searchSample(this.$route.params.projectname as string, this.$route.params.samplename as string, query)
          .then((response) => {
            this.resultSearch = response.data;
            this.visuTreeDial = true;
          })
          .catch((error) => {
            notifyError({ error });
          });
      } else {
        api
          .searchProject(this.$route.params.projectname as string, query)
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
