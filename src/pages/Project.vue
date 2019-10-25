<template>
    <q-page>
        <div class="q-pa-md row q-gutter-md flex flex-center">
            <q-card flat style="max-width: 100%">
                <q-card-section>
                    <div class="text-h6 text-center">Project: {{infos.name}}</div>
                    <div class="text-subtitle2 text-center">Admins: {{infos.admins}}</div>
                    <!-- <div class="tet-subtitle2 text-center">Selected: {{ JSON.stringify(table.selected) }}</div> -->
                    <div class="text-subtitle2 text-center">{{table.selected.length}}</div>
                </q-card-section>
                <q-card-section>
                <!-- <q-tabs v-model="tab" class="text-primary">
                    <q-tab label="Texts" name="texts" />
                    <q-tab label="Users" name="assignments" />
                </q-tabs>
                <q-separator /> -->
                <!-- <q-tab-panels v-model="tab" animated>
                    <q-tab-panel name="texts"> -->
                        <q-table
                            ref="textsTable"
                            class="my-sticky-header-table rounded-borders"
                            :title="infos.name + ' has ' + infos.samples.length + ' texts and '+ infos.number_sentences + ' sentences'"
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
                            table-header-class="text-primary"
                            card-class="shadow-8"
                            >

                            <template v-slot:top="props">
                                <q-btn-group flat >
                                    <q-btn flat color="default" text-color="blue-grey-8" icon="cloud_upload" @click="uploadDial = true">
                                        <q-tooltip :delay="300" content-class="text-white bg-primary" >Add File</q-tooltip>
                                    </q-btn>
                                    <q-btn flat color="default" text-color="blue-grey-8" icon="person_add" :disabled="table.selected.length<1" @click="assignDial = true">
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Assign</q-tooltip>
                                    </q-btn>
                                    <q-btn flat  color="default" text-color="blue-grey-8" icon="cloud_download" :disabled="table.selected.length<1">
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Export</q-tooltip>
                                    </q-btn>
                                    <q-btn v-show="table.selected.length<1" flat color="default" text-color="blue-grey-8" icon="delete_forever" disabled>
                                        <q-tooltip :delay="300" content-class="bg-white text-primary">Delete selected rows</q-tooltip>
                                    </q-btn>
                                    <q-btn v-show="table.selected.length!=0" :loading="table.loadingDelete" flat color="default" text-color="red" icon="delete_forever" @click="deleteSamples()" >
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
                                emit-value map-options  :options="filterFields(table)"  option-value="name" style="min-width: 100px"  >
                                    <q-tooltip :delay="300" content-class="bg-white text-primary">Select visible columns</q-tooltip>
                                </q-select>

                                <q-btn flat round dense text-color="blue-grey-8" :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"  @click="props.toggleFullscreen"  class="q-ml-md" />
                            </template>

                            <template v-slot:body="props">
                                
                                <q-tr :props="props">
                                    <q-td auto-width><q-checkbox  v-model="props.selected" /></q-td>
                                    <q-td key="samplename" :props="props"><q-btn outline color="white" text-color="black" 
                                    class="full-width" 
                                    :to="'/projects/' + infos.name + '/' + props.row.samplename" 
                                    icon-right="open_in_browser" no-caps>{{props.row.samplename}}</q-btn></q-td>
                                    <q-td key="sentences" :props="props">{{ props.row.sentences }}</q-td>
                                    <q-td key="tokens" :props="props">{{ props.row.tokens }}</q-td>
                                    <q-td key="sentenceLength" :props="props">{{ props.row.averageSentenceLength }}</q-td>
                                    <q-td key="annotators" :props="props">{{ props.row.roles.annotator }}</q-td>
                                    <q-td key="validators" :props="props">{{ props.row.roles.validator }}</q-td>
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
                    <!-- </q-tab-panel>

                    <q-tab-panel name="assignments">
                        
                    </q-tab-panel>
                </q-tab-panels> -->
                </q-card-section>
            </q-card>

            <q-dialog v-model="assignDial" persistent :maximized="maximizedToggle" transition-show="slide-up" transition-hide="slide-down" >
                <q-card class="bg-blue-grey-1 text-black" style="max-width: 100vw;">
                    <q-bar>
                        <q-space />
                        <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
                            <q-tooltip v-if="maximizedToggle" content-class="bg-white text-primary">Minimize</q-tooltip>
                        </q-btn>
                        <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
                            <q-tooltip v-if="!maximizedToggle" content-class="bg-white text-primary">Maximize</q-tooltip>
                        </q-btn>
                        <q-btn dense flat icon="close" v-close-popup>
                            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
                        </q-btn>
                    </q-bar>

                    <q-card-section>
                        <q-table
                            ref="usersTable"
                            class="my-sticky-header-table rounded-borders"
                            title="Users"
                            :data="assignTable.data"
                            :columns="assignTable.fields"
                            row-key="username"
                            :pagination.sync="assignTable.pagination"
                            :loading="assignTable.loading"
                            loading-label="loading"
                            :filter="assignTable.filter"
                            binary-state-sort
                            :visible-columns="assignTable.visibleColumns"
                            selection="multiple"
                            :selected.sync="assignTable.selected"
                            dense
                            table-header-class="text-primary"
                            card-class="shadow-8"
                            >

                            <template v-slot:top="props">
                                <q-btn-group flat >
                                    <q-btn rounded push color="primary" label="validate" :disabled="assignTable.selected.length <1" >
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Validate</q-tooltip>
                                    </q-btn>
                                </q-btn-group>

                                <q-space />

                                {{table.selected}}

                                <q-input  dense debounce="300" v-model="assignTable.filter" placeholder="Search" text-color="blue-grey-8" >
                                    <template v-slot:append>
                                        <q-icon name="search" />
                                    </template>
                                    <q-tooltip :delay="300" content-class="bg-white text-primary">Search a user</q-tooltip>
                                </q-input>
                                
                                <q-space />

                                <q-select v-model="assignTable.visibleColumns" multiple borderless dense options-dense :display-value="$q.lang.table.columns"
                                emit-value map-options  :options="filterFields(assignTable)"  option-value="name" style="min-width: 100px"  >
                                    <q-tooltip :delay="300" content-class="bg-white text-primary">Select visible columns</q-tooltip>
                                </q-select>

                                <q-btn flat round dense text-color="blue-grey-8" :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"  @click="props.toggleFullscreen"  class="q-ml-md" />
                            </template>

                            <template v-slot:body="props">
                                
                                <q-tr :props="props">
                                    <q-td auto-width><q-toggle dense v-model="props.selected" /></q-td>
                                    <q-td key="picture_url" :props="props"><q-avatar><img :src="props.row.picture_url" /></q-avatar></q-td>
                                    <q-td key="name" :props="props">{{props.row.username}}</q-td>
                                    <q-td key="email" :props="props">{{ props.row.id }}</q-td>
                                    <q-td key="super_admin" :props="props">{{ props.row.super_admin }}</q-td>
                                    <q-td key="last_seen" :props="props">{{ props.row.last_seen }}</q-td>
                                </q-tr>
                                
                            </template>

                        </q-table>
                    </q-card-section>
                </q-card>
            </q-dialog>

            <q-dialog v-model="uploadDial" :maximized="maximizedUploadToggle" transition-show="fade" transition-hide="fade" >
                <q-card style=" max-width: 100vw;">
                    <q-bar>
                        <q-space />
                        <q-btn dense flat icon="minimize" @click="maximizedUploadToggle = false" :disable="!maximizedUploadToggle">
                            <q-tooltip v-if="maximizedUploadToggle" content-class="bg-white text-primary">Minimize</q-tooltip>
                        </q-btn>
                        <q-btn dense flat icon="crop_square" @click="maximizedUploadToggle = true" :disable="maximizedUploadToggle">
                            <q-tooltip v-if="!maximizedUploadToggle" content-class="bg-white text-primary">Maximize</q-tooltip>
                        </q-btn>
                        <q-btn dense flat icon="close" v-close-popup>
                            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
                        </q-btn>
                    </q-bar>

                    <q-card-section>
                        <div class="text-h6 text-blue-grey-8">Select one or multiple conll files</div>
                    </q-card-section>
                    
                    <q-card-section > 
                        <form @submit="upload()">
                            <input type="file" class="form-control" @change="onFileChange" multiple/>
                            <q-btn type="submit" :loading="submitting" label="upload" color="teal" class="q-mt-md">
                                <template v-slot:loading>
                                    <q-spinner-facebook/>
                                </template>
                            </q-btn>
                        </form>
                    </q-card-section>
                </q-card>
            </q-dialog>

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
            assignDial: false,
            maximizedToggle: true,
            uploadDial: false,
            maximizedUploadToggle: false,
            infos: {
                name: '',
                is_private: false,
                description: '',
                image: '',
                samples: [],
                admins: [],
                guests: [],
                number_samples: 0,
                number_sentences: 0,
                number_tokens: 0,
                averageSentenceLength: 0.0
            },
            table:{
                fields: [
                    { name: 'samplename', label:'Name', sortable: true, field: 'samplename'},
                    { name: 'sentences', label: 'Nb Sentences', sortable: true, field: 'sentences' },
                    { name: 'tokens', label: 'Nb Tokens', sortable: true, field: 'number_tokens' },
                    { name: 'sentenceLength', label: 'Sentence Length', sortable: true, field: 'averageSentenceLength' },
                    { name: 'annotators', label: 'Annotators', sortable: true, field: 'roles.annotator' },
                    { name: 'validators', label: 'Validators', sortable: true, field: 'roles.validator' },
                    { name: 'treesFrom', label: 'Trees From', sortable: true, field: 'treesFrom' },
                    { name: 'exo', label: 'Exo', sortable: true, field: 'exo' }
                ],
                visibleColumns: ['samplename', 'sentences', 'tokens', 'sentenceLength', 'annotators', 'validators', 'treesFrom', 'exo'],
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
            },
            assignTable:{
                data: [],
                fields: [
                    { name: 'picture_url', label: 'Avatar', field: 'picture_url' },
                    { name: 'name', label: 'Name', field:'username', sortable: true },
                    { name: 'email', label: 'Mail', field: 'id', sortable: true },
                    { name: 'super_admin', label: 'Admin', field: 'super_admin', sortable: true },
                    { name: 'last_seen', label: 'Last Seen', field: 'last_seen', sortable: true}
                ],
                visibleColumns: [ 'picture_url', 'name', 'email' ],
                filter: '',
                selected: [],
                loading: false,
                pagination: {
                    sortBy: 'name',
                    descending: false,
                    page: 1,
                    rowsPerPage: 10
                },
                loadingDelete: false
            },
            submitting: false,
            attachment: { name: null, file: null}
        }
    },
    mounted(){
        this.getProjectInfos();
        this.getUsers();
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
        filterFields(tableJson) {
            // to remove some fields from visiblecolumns select options
            var tempArray = tableJson.fields.filter(function( obj ) {
                return obj.field !== 'syntInfo' && obj.field !== 'cat' && obj.field !== 'redistributions' ;
            });
            return tempArray;
        },
        getProjectInfos(){
            api.getProjectInfos(this.name).then(response => { console.log(response.data); this.infos = response.data; }).catch(error => {console.log(error)});
        },
        getUsers(){
            api.getUsers().then( response => {  this.assignTable.data = response.data;  }).catch(error => { console.log(error); });
        },
        upload(){
            var form = new FormData();
            for(const file of this.attachment.file){ form.append('files',file); }
            form.append('import_user',Store.getters.getUserInfos.username);
            api.uploadSample(this.name, form).then( response => { this.attachment.file = []; this.getProjectInfos(); }).catch(error => {console.log(error);});
        },
        onFileChange(event) {
            this.attachment.file = event.target.files;
        },
        deleteSamples(){
            for (const sample of this.table.selected) {
                api.deleteSample(this.infos.name, sample.samplename).then( response => { this.infos = response.data; this.table.selected = []; } ).catch(error => { console.log(error); });
            }
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