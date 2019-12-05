<template>
    <q-page :class="$q.dark.isActive?'bg-dark':'bg-grey-1'">
        <div class="q-pa-md row q-gutter-md flex flex-center">
            <q-card flat style="max-width: 100%">
                <q-card-section>
                    <q-toolbar class="  text-center">
                        <q-toolbar-title>
                        <span :class="($q.dark.isActive?'':'text-primary') + ' text-bold'">{{infos.name}}</span>
                        </q-toolbar-title>
                    </q-toolbar>
                </q-card-section>
                <q-card-section>
                        <q-table
                            ref="textsTable"
                            :class="($q.dark.isActive?'my-sticky-header-table-dark':'my-sticky-header-table' ) +  ' rounded-borders'"
                            title="Samples"
                            :data="infos.samples"
                            :columns="table.fields"
                            row-key="samplename"
                            :pagination.sync="table.pagination"
                            :loading="table.loading"
                            loading-label="loading"
                            :filter="table.filter"
                            binary-state-sort
                            :visible-columns="table.visibleColumns"
                            selection="multiple"
                            :selected.sync="table.selected"
                            :table-header-class="$q.dark.isActive?'text-white':'text-primary'"
                            card-class="shadow-8"
                            >

                            <template v-slot:top="props">
                                <q-btn-group flat>
                                    <q-btn flat color="default"  icon="cloud_upload" @click="uploadDial = true">
                                        <q-tooltip :delay="300" content-class="text-white bg-primary" >Add File</q-tooltip>
                                    </q-btn>
                                    <q-btn flat color="default"  icon="person_add" :disabled="table.selected.length<1" @click="assignDial = true">
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Assign</q-tooltip>
                                    </q-btn>
                                    <q-btn flat  color="default"  icon="cloud_download" :disabled="table.selected.length<1" @click="exportSamplesZip()">
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Export</q-tooltip>
                                    </q-btn>
                                    <q-btn v-show="table.selected.length<1" flat color="default"  icon="delete_forever" disabled>
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Delete selected rows</q-tooltip>
                                    </q-btn>
                                    <q-btn v-show="table.selected.length!=0" :loading="table.loadingDelete" flat color="default" text-color="red" icon="delete_forever" @click="deleteSamples()" >
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Delete selected rows</q-tooltip>
                                    </q-btn>
                                    <q-btn flat color="default"  icon="table_chart" @click="getRelationTable()" >
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Relation tables</q-tooltip>
                                    </q-btn>
                                </q-btn-group>

                                <q-space />

                                <q-input  dense debounce="300" v-model="table.filter" placeholder="Search" text-color="blue-grey-8" >
                                    <template v-slot:append>
                                        <q-icon name="search" />
                                    </template>
                                    <q-tooltip :delay="300" content-class="text-white bg-primary">Search a sample</q-tooltip>
                                </q-input>
                                
                                <q-space />

                                <q-select v-model="table.visibleColumns" multiple borderless dense options-dense :display-value="$q.lang.table.columns"
                                emit-value map-options  :options="filterFields(table)"  option-value="name" style="min-width: 100px"  >
                                    <q-tooltip :delay="300" content-class="text-white bg-primary">Select visible columns</q-tooltip>
                                </q-select>

                                <q-btn flat round dense  :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"  @click="props.toggleFullscreen"  class="q-ml-md" >
                                    <q-tooltip :delay="300" content-class="text-white bg-primary">Fullscreen table</q-tooltip>
                                </q-btn>
                            </template>

                            <template v-slot:body="props">
                                
                                <q-tr :props="props">
                                    <q-td auto-width><q-toggle dense v-model="props.selected" /></q-td>
                                    <q-td key="samplename" :props="props"><q-btn outline color="white" :text-color="$q.dark.isActive?'white':'black'" class="full-width" 
                                    :to="'/projects/' + infos.name + '/' + props.row.samplename" 
                                    icon-right="open_in_browser" no-caps>{{props.row.samplename}}</q-btn></q-td>
                                    <q-td key="sentences" :props="props">{{ props.row.sentences }}</q-td>
                                    <q-td key="tokens" :props="props">{{ props.row.tokens }}</q-td>
                                    <q-td key="sentenceLength" :props="props">{{ props.row.averageSentenceLength }}</q-td>
                                    <q-td key="annotators" :props="props">{{ props.row.roles.annotator }}</q-td>
                                    <q-td key="validators" :props="props">{{ props.row.roles.validator }}</q-td>
                                    <q-td key="profs" :props="props">{{ props.row.roles.prof }}</q-td>
                                    <q-td key="supervalidators" :props="props">{{ props.row.roles.supervalidator }}</q-td>
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

                            <template v-slot:no-data="props">
                                <div class="q-pa-md">
                                <div class="row">
                                    <div v-show="table.loading" class="col-5 offset-4"><q-circular-progress  indeterminate size="50px" :thickness="0.22" color="primary" :track-color="$q.dark.isActive?'grey':'grey-3'" /></div>
                                    <q-banner v-show="!table.loading" inline-actions class="text-white bg-negative">
                                        Oops! No data to display...
                                        <template v-slot:action>
                                            <q-btn flat color="white" label="try again" @click="getProjectInfos();" />
                                        </template>
                                    </q-banner>
                                </div>
                                </div>
                            </template>

                        </q-table>
                </q-card-section>
            </q-card>

            <q-page-sticky :position="breakpoint?'bottom-right':'top-right'" :offset="breakpoint?[18, 18]:[18,70]">
                <q-btn fab :icon="searchDial?'clear':'search'" color="primary" @click="searchDial = !searchDial"/>
            </q-page-sticky>

            <q-dialog v-model="searchDial" seamless position="right" >
                <grew-request-card :parentOnSearch="onSearch" ></grew-request-card>
            </q-dialog>

            <q-dialog v-model="assignDial" persistent transition-show="slide-up" transition-hide="slide-down" >
                <user-table :samples="table.selected" ></user-table>
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
                            <q-btn type="submit" :loading="uploadSample.submitting" label="upload" color="teal" class="q-mt-md">
                                <template v-slot:loading>
                                    <q-spinner-facebook/>
                                </template>
                            </q-btn>
                        </form>
                    </q-card-section>
                </q-card>
            </q-dialog>

            <q-dialog v-model="resultSearchDial" transition-show="fade" transition-hide="fade" >
                <result-view :searchresults="resultSearch" ></result-view>
            </q-dialog>

            <q-dialog v-model="relationTableDial" transition-show="fade" transition-hide="fade" >
                <relation-table :edges="relationTableInfos" ></relation-table>
            </q-dialog>

        </div>
    </q-page>
</template>

<script>

import { openURL } from 'quasar'
import api from '../boot/backend-api';
import Store from '../store/index';
import GrewRequestCard from '../components/GrewRequestCard';
import ResultView from '../components/ResultView';
import RelationTable from '../components/RelationTable';
import UserTable from '../components/UserTable';

export default {
    components: {
        GrewRequestCard, ResultView, RelationTable, UserTable
    },
    data(){
        return {
            tab: 'texts',
            btnTopClass: this.$q.dark.isActive?'white':'blue-grey-8',
            assignDial: false,
            uploadDial: false,
            searchDial: false,
            maximizedUploadToggle: false,
            resultSearchDial: false,
            relationTableDial: false,
            alerts: { 
                'uploadsuccess': { color: 'positive', message: 'Upload success'},
                'uploadfail': { color: 'negative', message: 'Upload failed', icon: 'report_problem' },
                'deletesuccess': { color: 'positive', message: 'Delete success'},
                'deletefail': { color: 'negative', message: 'Delete failed', icon: 'report_problem'}
            },
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
                    { name: 'profs', label: 'Profs', sortable: true, field: 'roles.prof' },
                    { name: 'supervalidators', label: 'Super Validators', sortable: true, field: 'roles.supervalidator' },
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
                },
                loadingDelete: false
            },
            uploadSample: {
                submitting: false,
                attachment: { name: null, file: null}
            },
            resultSearch: {},
            relationTableInfos: {},
            window: {width: 0, height: 0 }
        }
    },
    created() { window.addEventListener('resize', this.handleResize); this.handleResize(); },
    destroyed() { window.removeEventListener('resize', this.handleResize)},
    mounted(){
        this.getProjectInfos();
    },
    computed: {
        routePath() { return this.$route.path; },
        breakpoint(){ return this.window.width <= 400; }
    },
    methods:{
        handleResize() {this.window.width = window.innerWidth; this.window.height = window.innerHeight;},
        goToRoute(props) { this.$router.push('/projects/' + this.infos.name + '/samples') },
        filterFields(tableJson) {
            // to remove some fields from visiblecolumns select options
            var tempArray = tableJson.fields.filter(function( obj ) {
                return obj.field !== 'syntInfo' && obj.field !== 'cat' && obj.field !== 'redistributions' ;
            });
            return tempArray;
        },
        getProjectInfos(){ this.table.loading = true; api.getProjectInfos(this.$route.params.projectname).then(response => { this.infos = response.data; this.table.loading = false;}).catch(error => {console.log(error); this.table.loading = false;}); },
        upload(){
            var form = new FormData();
            this.uploadSample.submitting = true;
            for(const file of this.uploadSample.attachment.file){ form.append('files',file); }
            form.append('import_user',Store.getters.getUserInfos.username);
            api.uploadSample(this.$route.params.projectname, form).then( response => { this.uploadSample.attachment.file = []; this.getProjectInfos(); this.uploadDial = false; this.uploadSample.submitting = false; this.showNotif('top-right', 'uploadsuccess');})
            .catch(error => {console.log(error); this.uploadSample.submitting = false; this.uploadDial = false;});
        },
        onFileChange(event) { this.uploadSample.attachment.file = event.target.files; },
        deleteSamples(){
            for (const sample of this.table.selected) {
                api.deleteSample(this.infos.name, sample.samplename).then( response => { this.infos = response.data; this.table.selected = []; this.showNotif('top-right', 'deletesuccess'); } ).catch(error => { console.log(error); this.showNotif('top-right', 'deletefail'); });
            }
        },
        exportSamplesZip(){
            var samplenames = [];
            for (const sample of this.table.selected) { samplenames.push(sample.samplename) }
            api.exportSamplesZip(samplenames, this.$route.params.projectname).then( response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'dump.zip');
                document.body.appendChild(link);
                link.click();
                return [];
            }).catch(error => {
                return [];
            });
        },
        getRelationTable() {
            api.getRelationTable(this.$route.params.projectname).then(response => {
                this.relationTableInfos = response.data;
                this.relationTableDial = true;
            }).catch(error => {console.log(error);});
        },
        onSearch(searchPattern){
            var query = { pattern: searchPattern };
            api.searchProject(this.$route.params.projectname, query)
            .then(response => {
                this.resultSearchDial = true;
                this.resultSearch = response.data;
            }).catch(error => {console.log(error);})
        },
        showNotif (position, alert) {
            const { color, textColor, multiLine, icon, message, avatar, actions } = this.alerts[alert];
            const buttonColor = color ? 'white' : void 0;
            this.$q.notify({
                color,
                textColor,
                icon: icon,
                message,
                position,
                avatar,
                multiLine,
                actions: actions,
                timeout: 2000
            })
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
.my-sticky-header-table-dark
  /* max height is important */
  .q-table__middle
    max-height 70vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color $black-1 /* #eeeeee */

  thead tr:first-child th
    position sticky
    top 0
    opacity 1
    z-index 1
</style>