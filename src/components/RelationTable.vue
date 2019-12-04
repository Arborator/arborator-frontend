<template>
    <q-card style=" max-width: 100vw;">
        <q-bar class="bg-primary text-white">
            <q-space />
            <div class="text-weight-bold">RelationTables</div>
            <q-space />
            <q-btn flat dense icon="close" v-close-popup/>
        </q-bar>
        <q-card-section >
            <div class="row q-gutter-lg">
                <div class="col-2">
                    <q-toolbar class="  text-center">
                        <q-toolbar-title>
                        <span class="text-primary text-bold">Select an edge</span>
                        </q-toolbar-title>
                    </q-toolbar>
                    <q-scroll-area
                    visible 
                    style="height: 80vh;"
                    >
                    <q-list separator>
                        <q-item v-for="e in edgesList" :key="e" clickable v-ripple :active="e == currentEdge" active-class="bg-grey-4 text-primary text-bold">
                            <q-item-section @click="select(e)" >{{e}}</q-item-section>
                        </q-item>
                    </q-list>
                    </q-scroll-area>
                </div>
                <div class="col-9">
                    <q-toolbar class="  text-center">
                        <q-toolbar-title>
                        <span v-show="currentEdge.length > 0" class="text-primary text-bold">{{'Relation Table for ' + currentEdge}}</span>
                        </q-toolbar-title>
                    </q-toolbar>
                    <q-table
                        v-show="currentEdge.length > 0"
                        ref="relationTable"
                        class="rounded-borders"
                        :data="table.rows"
                        :columns="table.columns"
                        :pagination.sync="table.pagination"
                        row-key="gov"
                    >

                        <template v-slot:body-cell="props">
                            <q-td :props="props">
                                <span v-if="isString(props.value)"> <span class="text-grey text-bold"> {{props.value}} </span> </span>
                                <span v-else-if="Object.keys(props.value).length < 1" >  </span>
                                <q-btn v-else color="primary" :label="Object.keys(props.value).length" @click="showTrees(props.value)" />
                            </q-td>
                        </template>
                    </q-table>
                </div>
            </div>
            
        </q-card-section>
        <q-dialog v-model="visuTreeDial" maximized transition-show="fade" transition-hide="fade" >
            <result-view :searchresults="selectedResults" ></result-view>
        </q-dialog>
    </q-card>
</template>

<script>
import ResultView from '../components/ResultView.vue';
import dummydata from '../assets/data.json';

export default {
    components: {ResultView},
    props: ['edges'],
    data(){
        return {
            currentEdge: '',
            visuTreeDial: false,
            selectedResults: {},
            edgesList: Object.keys(this.edges),
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
    methods: {
        createTable(edge){
            var keyset = new Set();
            for( let gov of Object.keys(this.edges[edge])){ keyset.add(gov); for( let dep of Object.keys(this.edges[edge][gov]) ) keyset.add(dep); }
            // construct fields
            let fields = [{ name: 'gov', label: row => 'Governor: ' + row.gov, 'field': row => row.gov}];
            for ( let key of keyset ){ fields.push( { name: key, align: 'center', label: key, field: key} ); }
            this.table.columns = fields;
            // construct rows
            let rows = [];
            for ( let gov of keyset) {
                let row = { gov: gov };
                for (let dep of keyset){
                    if(!this.edges[edge].hasOwnProperty(gov)) { row[dep] = {}; continue; }
                    if(!this.edges[edge][gov].hasOwnProperty(dep) )  { row[dep] = {}; continue; }
                    row[dep] = this.edges[edge][gov][dep]; // A REMETTRE APREs
                    // row[dep] = {'hi':'hi', 'ho': 'hi'}; // DUMMY RESULT
                }
                rows.push(row);
            }
            this.table.rows = rows;
            this.table.pagination.rowsNumber = rows.length;
        },
        select(edge){
            this.createTable(edge);
            this.currentEdge = edge;
        },
        showTrees(props) {
            this.selectedResults = props;
            this.visuTreeDial = true;
        },
        isString: function(s) {
            return typeof s === 'string' || s instanceof String;
        }
    }, 
    mounted(){
        this.edges = this.createTable();//dummydata;
        
    }
}
</script>
