<template>
    <q-page>
        <div class="q-pa-md row q-gutter-md flex flex-center">
            <q-card flat style="max-width: 100%">
                <q-card-section>
                    <div class="text-h6 text-center">Project: {{infos.name}}</div>
                    <div class="text-subtitle2 text-center">by {{infos.creator}}</div>
                </q-card-section>
                <q-card-section>
                <q-tabs v-model="tab" class="text-primary">
                    <q-tab label="Texts" name="texts" />
                    <q-tab label="Users" name="assignments" />
                </q-tabs>
                <q-separator />
                <q-tab-panels v-model="tab" animated>
                    <q-tab-panel name="texts">
                        <q-table
                            ref="textsTable"
                            class="my-sticky-header-table rounded-borders"
                            :title="infos.project_name + ' has ' + infos.samples.length + ' texts and '+ infos.number_sentences + ' sentences'"
                            :data="infos.samples"
                            :columns="table.fields"
                            row-key="project_name"
                            :pagination.sync="table.pagination"
                            :loading="table.loading"
                            loading-label="loading"
                            :filter="table.filter"
                            binary-state-sort
                            :visible-columns="table.visibleColumns"
                            selection="multiple"
                            :selected.sync="table.selected"
                            dense
                            table-header-class="text-primary"
                            card-class="shadow-8"
                            
                            >

                            <template v-slot:top="props">
                                <q-btn-group flat >
                                    <q-btn flat color="default" text-color="blue-grey-8" icon="cloud_upload" >
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Add File</q-tooltip>
                                    </q-btn>
                                    <q-btn flat color="default" text-color="blue-grey-8" icon="person_add" >
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Assign</q-tooltip>
                                    </q-btn>
                                    <q-btn flat  color="default" text-color="blue-grey-8" icon="cloud_download" :disabled="table.selected.length<1">
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Export</q-tooltip>
                                    </q-btn>
                                    <q-btn v-show="table.selected.length<1" flat color="default" text-color="blue-grey-8" icon="delete_forever" disabled>
                                        <q-tooltip :delay="300" content-class="bg-white text-primary">Delete selected rows</q-tooltip>
                                    </q-btn>
                                    <q-btn v-show="table.selected.length!=0" :loading="table.loadingDelete" flat color="default" text-color="red" icon="delete_forever" >
                                        <q-tooltip :delay="300" content-class="bg-white text-primary">Delete selected rows</q-tooltip>
                                    </q-btn>
                                </q-btn-group>

                                <q-space />

                                <q-input  dense debounce="300" v-model="table.filter" placeholder="Search" text-color="blue-grey-8" >
                                    <template v-slot:append>
                                        <q-icon name="search" />
                                    </template>
                                    <q-tooltip :delay="300" content-class="bg-white text-primary">Search a text</q-tooltip>
                                </q-input>
                                
                                <q-space />

                                <q-select v-model="table.visibleColumns" multiple borderless dense options-dense :display-value="$q.lang.table.columns"
                                emit-value map-options  :options="filterFields()"  option-value="name" style="min-width: 100px"  >
                                    <q-tooltip :delay="300" content-class="bg-white text-primary">Select visible columns</q-tooltip>
                                </q-select>

                                <q-btn flat round dense text-color="blue-grey-8" :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"  @click="props.toggleFullscreen"  class="q-ml-md" />
                            </template>

                            <template v-slot:body="props">
                                
                                <q-tr :props="props">
                                    <q-td auto-width><q-toggle dense v-model="props.selected" /></q-td>
                                    <q-td key="projectname" :props="props"><q-btn outline color="white" text-color="black" dense
                                    class="full-width" 
                                    :to="'/projects/' + infos.name + '/' + props.row.projectname" 
                                    icon-right="open_in_browser" no-caps>{{props.row.projectname}}</q-btn></q-td>
                                    <q-td key="sentences" :props="props">{{ props.row.sentences }}</q-td>
                                    <q-td key="tokens" :props="props">{{ props.row.tokens }}</q-td>
                                    <q-td key="sentenceLength" :props="props">{{ props.row.sentenceLength }}</q-td>
                                    <q-td key="annotators" :props="props">{{ props.row.annotators }}</q-td>
                                    <q-td key="validator" :props="props">{{ props.row.validators }}</q-td>
                                    <q-td key="treesFrom" :props="props">
                                        <q-list dense>
                                            <q-item v-for="source in props.row.treesFrom" :key="source" :props="source" >
                                                <q-item-label caption>{{source}}</q-item-label>
                                            </q-item>
                                        </q-list>
                                    </q-td>
                                    <q-td key="exo" :props="props">{{ props.row.exo }}</q-td>
                                </q-tr>
                                
                            </template>

                        </q-table>
                    </q-tab-panel>

                    <q-tab-panel name="assignments">
                        
                    </q-tab-panel>
                </q-tab-panels>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script>

import { openURL } from 'quasar'
import api from '../boot/backend-api';
import Store from '../store/index';

export default {
    props: ['name'],
    data(){
        return {
            tab: 'texts',
            infos: {
                name: this.name,
                creator: 'admin',
                samples: [ 
                    { projectname: 'P_ABJ_GWA_10_Steven.lifestory_PRO', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text2', sentences: 178, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text3', sentences: 80, tokens: 54, sentenceLength: 12.6, annotators: [], validator: 'Kim Gerdes', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text4', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text5', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text6', sentences: 80, tokens: 34, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text7', sentences: 32, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text8', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text9', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text10', sentences: 4567, tokens: 400, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text11', sentences: 80, tokens: 20, sentenceLength: 16.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text12', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text13', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { projectname: 'text14', sentences: 80, tokens: 20, sentenceLength: 14.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                ],
                assignments: [
                    { username: 'Jo', assignedTexts: [], modifiedTrees: 30 }
                ]
            },
            // infos: {
            //     "project_name": "Naija",
            //     "description": "this is a test project to fill the database",
            //     "samples": [
            //         "P_WAZP_07_Imonirhuas.Life.Story_PRO",
            //         "P_ABJ_GWA_10_Steven.lifestory_PRO"
            //     ],
            //     "admins": [],
            //     "guests": [],
            //     "number_samples": 2,
            //     "number_sentences": 342
            // },
            table:{
                fields: [
                    { name: 'projectname', label:'Name', sortable: true, field: 'projectname'},
                    { name: 'sentences', label: 'Nb Sentences', sortable: true, field: 'sentences' },
                    { name: 'tokens', label: 'Nb Tokens', sortable: true, field: 'tokens' },
                    { name: 'sentenceLength', label: 'Sentence Length', sortable: true, field: 'sentenceLength' },
                    { name: 'annotators', label: 'Annotators', sortable: true, field: 'annotators' },
                    { name: 'validator', label: 'Validator', sortable: true, field: 'validator' },
                    { name: 'treesFrom', label: 'Trees From', sortable: true, field: 'treesFrom' },
                    { name: 'exo', label: 'Exo', sortable: true, field: 'exo' }
                    
                
                ],
                visibleColumns: ['projectname', 'sentences', 'tokens', 'sentenceLength', 'annotators', 'validator', 'treesFrom', 'exo'],
                filter: '',
                selected: [],
                loading: false,
                pagination: {
                    sortBy: 'name',
                    descending: false,
                    page: 1,
                    rowsPerPage: 10
                    // rowsNumber: this.infos.texts.length
                },
                loadingDelete: false
            }
        }
    },
    mounted(){
        // this.getProjectInfos()
    },
    computed: {
        // totalSentences: function() {
        //     return this.infos.texts.reduce((acc, item) => acc + item.sentences, 0);
        // }
    },
    methods:{
        goToRoute(props) {
            this.$router.push('/projects/' + this.infos.name + '/samples')
        },
        filterFields() {
            // to remove some fields from visiblecolumns select options
            var tempArray = this.table.fields.filter(function( obj ) {
                return obj.field !== 'syntInfo' && obj.field !== 'cat' && obj.field !== 'redistributions' ;
            });
            return tempArray;
        },
        getProjectInfos(){
            api.getProjectInfos(this.name)
            .then(response => { 
                console.log(response.data)
                this.infos = response.data;
            }).catch(error => {console.log(error)});
        }
    }
}
</script>

<style lang="stylus">
.my-sticky-header-table
  /* max height is important */
  .q-table__middle
    max-height 70vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color $grey-1 /* #eeeeee */

  thead tr:first-child th
    position sticky
    top 0
    opacity 1
    z-index 1
</style>