<template>
    <q-card style=" max-width: 100vw;">
        <q-bar class="bg-primary text-white">
            <q-space />
            <div class="text-weight-bold">RelationTables</div>
            <q-space />
            <q-btn flat dense icon="close" v-close-popup/>
        </q-bar>
        <q-card-section>
            <div class="row q-gutter-lg" style="height: 80vh; width:90vw;">
                <div class="col-2">
                    <q-toolbar class="  text-center">
                        <q-toolbar-title>
                        <span class="text-primary text-bold">Select an edge</span>
                        </q-toolbar-title>
                    </q-toolbar>
                    <q-scroll-area visible style="height: 80vh;">
                        <div>
                        <q-input ref="filter" filled v-model="filter" label="filter dependency relations">
                            <template v-slot:append>
                                <q-icon v-if="filter !== ''" name="clear" class="cursor-pointer" @click="resetFilter" />
                            </template>
                            </q-input>
                            <q-tree
                                ref='tree'
                                :nodes="relationtree"
                                node-key="label"
                                :filter="filter"
                                default-expand-all
                                :selected.sync="currentEdge" 
                                selected-color="primary"
                                @update:selected="getTable($event)"
                            />
                        </div>

                    <!-- <q-list separator>
                        <q-item v-for="e in edgesList" :key="e" clickable v-ripple :active="e == currentEdge" active-class="bg-grey-4 text-primary text-bold">
                            <q-item-section @click="select(e)" >{{e}}</q-item-section>
                        </q-item>
                    </q-list> -->
                    </q-scroll-area>
                </div>
                <div class="col-9" v-show="currentEdge.length > 0" :data="getTable">
                    <q-toolbar class="  text-center" >
                        <q-toolbar-title>
                        <span  class="text-primary text-bold">{{'Relation Table for "' + currentEdge + '" containing a total of '+relationstotal[currentEdge]+ ' occurrences'}}</span>
                        </q-toolbar-title>
                    </q-toolbar>
                    <q-table
                        ref="relationTable"
                        class="rounded-borders"
                        :data="table.rows"
                        :columns="table.columns"
                        :pagination.sync="table.pagination"
                        row-key="gov"
                        hide-bottom
                    >
                        <template v-slot:body-cell="props">
                            <q-td :props="props">
                                <span v-if="isString(props.value)"> <span class="primary" style="font-weight: 500;">{{props.value}} </span> </span>
                                <span v-else-if="Object.keys(props.value).length < 1" >  </span>
                                <q-btn v-else color="primary" :label="Object.keys(props.value).length" @click="showTrees(props.value)" />
                            </q-td>
                        </template>
                    </q-table>
                </div>
            </div>
            
        </q-card-section>
        <q-dialog v-model="visuTreeDial" maximized transition-show="fade" transition-hide="fade" >
            <result-view :searchresults="selectedResults" :totalsents="relationstotal[currentEdge]" :searchscope="tablename"></result-view>
        </q-dialog>
    </q-card>
</template>

<script>
import ResultView from '../components/ResultView.vue';
import { QTree } from 'quasar'
// import dummydata from '../assets/data.json';

export default {
    components: {ResultView, QTree},
    props: ['edges'],
    data(){
        return {
            currentEdge: '',
            visuTreeDial: false,
            selectedResults: {},
            relationstotal: {},
            relationtree: [],
            filter: '',
            tablename: '',
            edgesList: Object.keys(this.edges).sort(),
            table:{
                rows: [],
                columns: [],
                pagination: {
                    sortBy: 'name',
                    descending: false,
                    page: 2,
                    rowsPerPage: 50,
                    rowsNumber: 0
                }
            }
        }
    },
    computed: {
        // sentenceCount() {return 17}, // todo get the total number of sentences in the table
    },
    methods: {
        /**
         * Create the table  based on the update event on selected list
         * 
         * @param {Event} eve
         * @returns void
         */
        getTable(eve) {
            // console.log(444,eve,this.edges, this.currentEdge)
            var keyset = new Set();
            // var table = {};
            for( let gov of Object.keys(this.edges[this.currentEdge])){ 
                keyset.add(gov); for( let dep of Object.keys(this.edges[this.currentEdge][gov]) ) keyset.add(dep); 
                }
            // construct fields
            // let fields = [{ name: 'gov', label: row => 'Governor: ' + row.gov, 'field': row => row.gov}];
            let fields = [{ name: 'gov', label: '↗', 'field': row => row.gov}];
            for ( let key of keyset ){ fields.push( { name: key, align: 'center', label: key, field: key} ); }
            this.table.columns = fields;
            this.relationstotal[this.currentEdge] = 0;
            // construct rows
            let rows = [];
            for ( let gov of keyset) {
                let row = { gov: gov };
                for (let dep of keyset){
                    if(!this.edges[this.currentEdge].hasOwnProperty(gov)) { row[dep] = {}; continue; }
                    if(!this.edges[this.currentEdge][gov].hasOwnProperty(dep) )  { row[dep] = {}; continue; }
                    row[dep] = this.edges[this.currentEdge][gov][dep]; 
                    this.relationstotal[this.currentEdge]+=Object.keys(this.edges[this.currentEdge][gov][dep]).length;
                }
                rows.push(row);
            }
            this.table.rows = rows;
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
            this.filter=''
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
        showTrees(props) {
            this.tablename = this.currentEdge+' relation table'
            this.selectedResults = props;
            this.visuTreeDial = true;
        },
        /**
         * Check whether variable s is a String or not
         * 
         * @param {*} s 
         * @returns {Boolean}
         */
        isString: function(s) {
            return typeof s === 'string' || s instanceof String;
        }
    }, 
    mounted(){
        const splitters = this.$store.getters.getProjectConfig.annotationFeatures.DEPREL.map(({ join }) => join).join('')
        const splitregex = new RegExp('['+ splitters +']', 'g') // = /[:@]/g  
       
        this.relationtree = [];
        var lasta = this.relationtree
        var match;
        for (let edge of this.edgesList) {
            while ((match = splitregex.exec(edge+splitters[0]))) {
                const r = edge.substr(0,match.index);
                var alr = lasta.filter(rr => rr.label==r);
                if (alr.length==0)
                {
                    var newo = {'label':r, 'children':[]}
                    newo.selectable = (r==edge) // some labels don't exist without children
                    newo.icon = (r==edge)?'view_module':null;
                    lasta.push(newo);
                }
                else newo = alr[0];
                lasta = newo.children;                 
            }
            lasta = this.relationtree
        }
        // this.$refs.tree.expandAll(); // doesn't seem to work without timeout
        setTimeout(()=>{this.$refs.tree.expandAll(); this.$refs.filter.focus()}, 500)
        
    }
}
</script>
