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
          <q-table
            ref="relationTable"
            class="rounded-borders"
            :rows="table.rows"
            :columns="table.columns"
            :v-model:pagination="table.pagination"
            row-key="gov"
            hide-bottom
          >
            <template #body-cell="props">
              <q-td :props="props">
                <span v-if="isString(props.value)">
                  <span class="primary" style="font-weight: 500">{{ props.value }} </span>
                </span>
                <span v-else-if="Object.keys(props.value).length < 1"> </span>
                <q-btn v-else color="primary" :label="Object.keys(props.value).length" @click="showTrees(props.value)" />
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
    </q-card-section>
    <q-dialog v-model="visuTreeDial" maximized transition-show="fade" transition-hide="fade">
      <result-view :searchresults="selectedResults" :totalsents="relationstotal[currentEdge]" :searchscope="tablename"></result-view>
    </q-dialog>
  </q-card>
</template>

<script lang="ts">
import { QTree } from 'quasar';
import ResultView from '../ResultView.vue';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
// import dummydata from '../assets/data.json';

import { defineComponent } from 'vue';

export default defineComponent({
  components: { ResultView, QTree },
  props: ['edges'],
  data() {
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
        pagination: {
          sortBy: 'name',
          descending: false,
          page: 2,
          rowsPerPage: 50,
          rowsNumber: 0,
        },
      },
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
      // console.log(444,eve,this.edges, this.currentEdge)
      const keyset = new Set();
      // var table = {};
      for (const gov of Object.keys(this.edges[this.currentEdge])) {
        keyset.add(gov);
        for (const dep of Object.keys(this.edges[this.currentEdge][gov])) keyset.add(dep);
      }
      // construct fields
      // let fields = [{ name: 'gov', label: row => 'Governor: ' + row.gov, 'field': row => row.gov}];
      const fields = [{ name: 'gov', label: '↗', field: (row: any) => row.gov }];
      for (const key of keyset) {
        (fields as any).push({
          name: key,
          align: 'center',
          label: key,
          field: key,
        });
      }
      this.table.columns = fields as any;
      (this.relationstotal as any)[this.currentEdge] = 0;
      // construct rows
      const rows = [];
      for (const gov of keyset) {
        const row = { gov } as any;
        for (const dep of keyset) {
          if (!Object.prototype.hasOwnProperty.call(this.edges[this.currentEdge], gov as any)) {
            row[dep as string] = {} as any;
            continue;
          }
          if (!Object.prototype.hasOwnProperty.call(this.edges[this.currentEdge], dep as any)) {
            row[dep as string] = {} as any;
            continue;
          }
          row[dep as string] = this.edges[this.currentEdge][gov as string][dep as string];
          (this.relationstotal as any)[this.currentEdge] += Object.keys(this.edges[this.currentEdge][gov as string][dep as string]).length as any;
        }
        rows.push(row);
      }
      this.table.rows = rows as any;
      this.table.pagination.rowsNumber = rows.length;
    },
    // createTable(edge){
    //     var keyset = new Set();
    //     for( let gov of Object.keys(this.edges[edge])){
    //         keyset.add(gov); for( let dep of Object.keys(this.edges[edge][gov]) ) keyset.add(dep);
    //         }
    //     // construct fields
    //     // let fields = [{ name: 'gov', label: row => 'Governor: ' + row.gov, 'field': row => row.gov}];
    //     let fields = [{ name: 'gov', label: '↗', 'field': row => row.gov}];
    //     for ( let key of keyset ){ fields.push( { name: key, align: 'center', label: key, field: key} ); }
    //     this.table.columns = fields;
    //     this.relationstotal[edge] = 0;
    //     // construct rows
    //     let rows = [];
    //     for ( let gov of keyset) {
    //         let row = { gov: gov };
    //         for (let dep of keyset){
    //             if(!this.edges[edge].hasOwnProperty(gov)) { row[dep] = {}; continue; }
    //             if(!this.edges[edge][gov].hasOwnProperty(dep) )  { row[dep] = {}; continue; }
    //             row[dep] = this.edges[edge][gov][dep];
    //             this.relationstotal[edge]+=Object.keys(this.edges[edge][gov][dep]).length;
    //         }
    //         rows.push(row);
    //     }
    //     this.table.rows = rows;
    //     this.table.pagination.rowsNumber = rows.length;
    // },
    /**
     * Set the filter to an empty string
     *
     * @returns void
     */
    resetFilter() {
      this.filter = '';
    },
    // select(){
    //     console.log(33);
    //     //JSON.stringify(this.edges[edge]));
    //     this.createTable(this.currentEdge);

    //     // this.currentEdge = edge;
    // },
    /**
     * Show the trees considering the table row props
     *
     * @param {Object} props
     * @returns void
     */
    showTrees(props: any) {
      this.tablename = `${this.currentEdge} relation table`;
      this.selectedResults = props;
      this.visuTreeDial = true;
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
