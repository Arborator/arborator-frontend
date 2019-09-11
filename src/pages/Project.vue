<template>
    <q-page>
        <div class="q-pa-md row q-gutter-md flex flex-center">
            <q-card flat >
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
                            :title="infos.name + ' has ' + infos.texts.length + ' texts and '+ totalSentences + ' sentences'"
                            :data="infos.texts"
                            :columns="table.fields"
                            row-key="name"
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
                                    <q-btn flat color="default" text-color="blue-grey-8" icon="create" >
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Add new entry</q-tooltip>
                                    </q-btn>
                                    <q-btn v-show="table.selected.length<1" flat color="default" text-color="brown" icon="delete_forever" disabled>
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
                                    <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                                    <q-td key="sentences" :props="props">{{ props.row.sentences }}</q-td>
                                    <q-td key="tokens" :props="props">{{ props.row.tokens }}</q-td>
                                    <q-td key="sentenceLength" :props="props">{{ props.row.sentenceLength }}</q-td>
                                    <q-td key="annotators" :props="props">{{ props.row.annotators }}</q-td>
                                    <q-td key="validator" :props="props">{{ props.row.validators }}</q-td>
                                    <q-td key="treesFrom" :props="props">{{ props.row.treesFrom }}</q-td>
                                    <q-td key="exo" :props="props">{{ props.row.exo }}</q-td>
                                </q-tr>
                            </template>

                        </q-table>
                    </q-tab-panel>

                    <q-tab-panel name="assignments">
                    With so much content to display at once, and often so little screen real-estate,
                    Cards have fast become the design pattern of choice for many companies, including
                    the likes of Google and Twitter.
                    </q-tab-panel>
                </q-tab-panels>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script>
export default {
    name:'project',
    data(){
        return {
            tab: 'texts',
            infos: {
                name: 'projectName',
                creator: 'admin',
                texts: [ 
                    { name: 'text1', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text2', sentences: 178, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text3', sentences: 80, tokens: 54, sentenceLength: 12.6, annotators: [], validator: 'Kim Gerdes', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text4', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text5', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text6', sentences: 80, tokens: 34, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text7', sentences: 32, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text8', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text9', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text10', sentences: 4567, tokens: 400, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text11', sentences: 80, tokens: 20, sentenceLength: 16.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text12', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text13', sentences: 80, tokens: 20, sentenceLength: 12.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                    { name: 'text14', sentences: 80, tokens: 20, sentenceLength: 14.6, annotators: [], validator: 'Bernard Caron', treesFrom: ['parser', 'tella', 'j.D'], exo: 'percentage'}, 
                ]
            },
            table:{
                fields: [
                    { name: 'name', label: 'Text Name', sortable: true, field: 'name' },
                    { name: 'sentences', label: 'Nb Sentences', sortable: true, field: 'sentences' },
                    { name: 'tokens', label: 'Nb Tokens', sortable: true, field: 'tokens' },
                    { name: 'sentenceLength', label: 'Sentence Length', sortable: true, field: 'sentenceLength' },
                    { name: 'annotators', label: 'Annotators', sortable: true, field: 'annotators' },
                    { name: 'validator', label: 'Validator', sortable: true, field: 'validator' },
                    { name: 'treesFrom', label: 'Trees From', sortable: true, field: 'treesFrom' },
                    { name: 'exo', label: 'Exo', sortable: true, field: 'exo' }
                
                ],
                visibleColumns: ['name', 'sentences', 'tokens', 'sentenceLength', 'annotators', 'validator', 'treesFrom', 'exo'],
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
        
    },
    computed: {
        totalSentences: function() {
            return this.infos.texts.reduce((acc, item) => acc + item.sentences, 0);
        }
    },
    methods:{
        filterFields() {
            // to remove some fields from visiblecolumns select options
            var tempArray = this.table.fields.filter(function( obj ) {
                return obj.field !== 'syntInfo' && obj.field !== 'cat' && obj.field !== 'redistributions' ;
            });
            return tempArray;
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