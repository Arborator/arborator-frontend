<template>
    <q-page :class="$q.dark.isActive?'bg-dark':'bg-grey-1'">
        <div class="q-pa-md row q-gutter-md flex flex-center">
            <q-card flat style="max-width: 100%;">
                <q-card-section>
                    <q-toolbar class="  text-center">
                        <q-toolbar-title>
                            <span :class="($q.dark.isActive?'':'text-primary') + ' text-bold'">{{infos.name}}</span> 
                            <q-btn v-if="super_admin || admin" flat round :color="$q.dark.isActive?'':'primary'" icon="settings" @click="projectSettingsDial=true">
                                <q-tooltip :delay="300" content-class="text-white bg-primary" >Modify project settings</q-tooltip>
                            </q-btn>
                            <q-btn v-else flat round :color="$q.dark.isActive?'':'primary'" icon="settings" @click="simpleProjectInfoDialog=true">
                                <q-tooltip :delay="300" content-class="text-white bg-primary" >View admininstrator information</q-tooltip>
                            </q-btn>
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
                            virtual-scroll
				            table-style="max-height:80vh"
                            :rows-per-page-options="[0]"
                            :key="tableKey"
                            @request="getProjectInfos"
                            >

                            <template v-slot:no-data="props">
                                <div class="q-pa-md">
                                <div class="row">
                                    <div v-show="table.loading" class="col-5 offset-4"><q-circular-progress  indeterminate size="50px" :thickness="0.22" color="primary" :track-color="$q.dark.isActive?'grey':'grey-3'" /></div>
                                    <q-banner v-show="!table.loading && !initLoad" inline-actions class="text-white bg-negative">
                                        Oops! No data to display...
                                        <template v-slot:action>
                                            <q-btn flat color="white" label="try again" @click="getProjectInfos();" />
                                        </template>
                                    </q-banner>
                                    <q-banner v-show="!table.loading && initLoad" inline-actions class="text-white bg-accent">
                                        No sample yet. This project is empty, please upload some conll files. <span v-show="!admin">Ask an administrator to add files</span>
                                        <div v-show="admin" class="q-pa-md column items-start q-gutter-y-md">
                                            <q-toggle v-model="robot.active" checked-icon="check" color="warning" label="Choose a custom import name?" unchecked-icon="clear"/>
                                            <q-input dark v-show="robot.active" v-model="robot.name" label="Custom Name for non real user import" />
                                            <q-file dark v-model="uploadSample.attachment.file" label="Pick files" outlined  use-chips clearable :loading="uploadSample.submitting" multiple style="max-width: 400px">
                                            <template v-slot:after >
                                                <q-btn color="primary" dense icon="cloud_upload" round @click="upload()" :loading="uploadSample.submitting" :disable="uploadSample.attachment.file == null"/>
                                            </template>
                                            </q-file>
                                        </div>
                                    </q-banner>
                                </div>
                                </div>
                            </template>

                            <template v-slot:top="props">
                                <q-btn-group flat>
                                    
                                    <q-btn v-if="admin || super_admin" flat color="default"  icon="cloud_upload" @click="uploadDial = true" >
                                        <q-tooltip v-if="(super_admin || admin)" :delay="300" content-class="text-white bg-primary" >Add CoNLL files as new samples</q-tooltip>
                                    </q-btn>
                                    
                                    <div>
                                        <q-btn flat  color="default"  icon="cloud_download" @click="exportSamplesZip()" :loading="table.exporting" :disable="(!infos.is_open && !guest && !admin && !super_admin) || table.selected.length<1">
                                        </q-btn>
                                        <q-tooltip v-if="table.selected.length<1" :delay="300" content-class="text-white bg-primary">Select the samples you want to export</q-tooltip>
                                        <q-tooltip v-else :delay="300" content-class="text-white bg-primary">Export selected samples</q-tooltip>
                                    </div>

                                    <q-btn v-if="admin || super_admin" v-show="table.selected.length<1" flat color="default"  icon="delete_forever" disable>
                                         <q-tooltip v-if="table.selected.length<1" :delay="300" content-class="text-white bg-primary">Select the samples you want to delete</q-tooltip>
                                        <q-tooltip v-else :delay="300" content-class="text-white bg-primary">Delete selected samples</q-tooltip>
                                    </q-btn>
                                
                                    <q-btn  v-if="admin || super_admin" v-show="table.selected.length!=0" :loading="table.loadingDelete" flat color="default" text-color="red" icon="delete_forever" @click="triggerConfirm(deleteSamples)" :disable="!admin && !super_admin">
                                        <q-tooltip :delay="300" content-class="text-white bg-primary">Delete selected samples</q-tooltip>
                                    </q-btn>

                                    <!-- ion-logo-github -->
                                    <q-btn-dropdown v-if="loggedWithGithub" :disable="table.selected.length<1" icon="ion-md-git-commit"  flat dense> <q-tooltip>Commit and push the selected samples to GitHub</q-tooltip>
                                        <q-list>
                                        <q-item clickable v-close-popup @click="commit('user')">
                                            <q-item-section avatar>
                                                <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar"></q-avatar>
                                                <q-icon v-else name="account_circle" /> 
                                            </q-item-section>
                                            <q-item-section>
                                                <q-item-label>Push only my trees of the selected samples</q-item-label>
                                            </q-item-section>
                                        </q-item>

                                        <q-item clickable v-close-popup @click="commit('user_recent')">
                                            <q-item-section avatar>
                                                <q-avatar v-if="isLoggedIn" size="1.2rem">
                                                    <img :src="avatar">
                                                    <q-badge floating transparent color="principal">+</q-badge>
                                                </q-avatar>
                                                <q-icon v-else name="account_circle" /><div></div> 
                                                
                                            </q-item-section>
                                            <q-item-section>
                                                <q-item-label>Push my trees of the selected samples, filled up with the most recent trees</q-item-label>
                                            </q-item-section>
                                        </q-item>

                                        <q-item v-if="admin || super_admin" clickable v-close-popup @click="commit('recent')">
                                            <q-item-section avatar>
                                                <q-icon name="schedule" />
                                            </q-item-section>
                                            <q-item-section>
                                                <q-item-label>Push the most recent trees</q-item-label>
                                            </q-item-section>
                                        </q-item>

                                        <q-item v-if="admin || super_admin" clickable v-close-popup @click="commit('all')">
                                            <q-item-section avatar>
                                                <q-icon name="ion-md-globe" />
                                            </q-item-section>                                        <q-item-section>
                                            <q-item-label>Push all trees of the selected samples</q-item-label>
                                        </q-item-section>
                                        </q-item>

                                        </q-list>
                                    </q-btn-dropdown>

                                    <q-btn-dropdown v-if="loggedWithGithub" :disable="false" icon="ion-md-git-pull-request"  flat dense> <q-tooltip>Pull from GitHub</q-tooltip>
                                        <q-list>
                                        <q-item clickable v-close-popup @click="pull('user')" :disable="table.selected.length<1" >
                                            <q-item-section avatar>
                                                <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar"></q-avatar>
                                                <q-icon v-else name="account_circle" /> 
                                            </q-item-section>
                                            <q-item-section>
                                                <q-item-label>Replace my trees from the selected samples with the ones from GitHub</q-item-label>
                                            </q-item-section>
                                        </q-item>

                                        <q-item v-if="admin || super_admin" clickable v-close-popup @click="pull('all')" :disable="table.selected.length<1" >
                                             <q-item-section avatar>
                                                <q-icon name="ion-md-globe" />
                                            </q-item-section>  
                                            <q-item-section>
                                                <q-item-label>Replace all trees from the selected samples with the ones from GitHub</q-item-label>
                                            </q-item-section>
                                        </q-item>

                                        <q-item v-if="admin || super_admin" clickable v-close-popup @click="pull('user_recent')">
                                            <q-item-section avatar>
                                                <q-icon name="ion-md-globe" />
                                            </q-item-section> 
                                            <q-item-section>
                                                <q-item-label>Replace all trees with the ones from GitHub</q-item-label>
                                            </q-item-section>
                                        </q-item>

                                        </q-list>
                                    </q-btn-dropdown>

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
                                    <q-td key="annotators" :props="props">
                                        <tag-input v-if="admin || super_admin" @tag-added="addAnnotator" @tag-removed="removeAnnotator" :tag-context="props.row" :element-id="props.row.samplename + 'annotatortag'" v-model="props.row.roles.annotator" :existing-tags="possiblesUsers" :typeahead="true" typeahead-style="badges" :typeahead-hide-discard="true" placeholder="add user" :only-existing-tags="true" :typeahead-always-show="false" ></tag-input>
                                        <q-list v-else dense>
                                            <q-item v-for="source in props.row.roles.annotator" :key="source" :props="source" >
                                                <q-item-label caption>{{source.value}}</q-item-label>
                                            </q-item>
                                        </q-list>
                                    </q-td>
                                    <q-td key="validators" :props="props">
                                        <tag-input v-if="admin || super_admin" @tag-added="addValidator"  @tag-removed="removeValidator" :tag-context="props.row" :element-id="props.row.samplename + 'validatortag'" v-model="props.row.roles.validator" :existing-tags="possiblesUsers" :typeahead="true" typeahead-style="badges" :typeahead-hide-discard="true" placeholder="add user" :only-existing-tags="true" :typeahead-always-show="false"></tag-input>
                                        <q-list v-else dense>
                                            <q-item v-for="source in props.row.roles.validator" :key="source" :props="source" >
                                                <q-item-label caption>{{source.value}}</q-item-label>
                                            </q-item>
                                        </q-list>
                                    </q-td>
                                    <q-td key="profs" :props="props">
                                        <tag-input v-if="admin || super_admin" @tag-added="addProf"  @tag-removed="removeProf" :tag-context="props.row" :element-id="props.row.samplename + 'proftag'" v-model="props.row.roles.prof" :existing-tags="possiblesUsers" :typeahead="true" typeahead-style="badges" :typeahead-hide-discard="true" placeholder="add user" :only-existing-tags="true" :typeahead-always-show="false"></tag-input>
                                        <q-list v-else dense>
                                            <q-item v-for="source in props.row.roles.prof" :key="source" :props="source" >
                                                <q-item-label caption>{{source.value}}</q-item-label>
                                            </q-item>
                                        </q-list>
                                    </q-td>
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
                </q-card-section>
            </q-card>
         

            <q-page-sticky :position="breakpoint?'bottom-right':'top-right'" :offset="breakpoint?[18, 18]:[18,70]">
                <q-btn size="20px" round @click="searchDialog = !searchDialog" color="primary" icon="img:../statics/svg/g.svg" >
                    <q-tooltip content-class="bg-primary" content-style="font-size: 16px" >
                         Search with Grew in the whole project
                    </q-tooltip>
                </q-btn>
            </q-page-sticky>

            <q-page-sticky :position="breakpoint?'bottom-right':'top-right'" :offset="breakpoint?[18, 88]:[18,140]" style="z-index:999">
                    <q-btn-group push flat rounded v-if="reltablebuttons">
                    <q-btn @click="getRelationTable('user')" push color="primary" no-caps>
                        <q-tooltip content-class="bg-primary" content-style="font-size: 16px" >
                            View only my trees
                        </q-tooltip>
                        <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar"></q-avatar>
                        <q-icon v-else name="account_circle" /> 
                    </q-btn>
                    <q-btn @click="getRelationTable('user_recent')" push color="primary" no-caps>
                        <q-tooltip content-class="bg-primary" content-style="font-size: 16px" >
                            View my trees, filled up with the most recent trees
                        </q-tooltip>
                        <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar"></q-avatar>
                        <q-icon v-else name="account_circle" /> 
                        <div>+</div>
                    </q-btn>
                    <q-btn @click="getRelationTable('recent')" push icon="schedule"  color="primary" no-caps v-if="admin || super_admin">
                        <q-tooltip content-class="bg-primary" content-style="font-size: 16px" >
                            View most recent trees
                        </q-tooltip>
                    </q-btn>
                    <q-btn @click="getRelationTable('all')" push icon="ion-md-globe"  color="primary" no-caps v-if="admin || super_admin">
                        <q-tooltip content-class="bg-primary" content-style="font-size: 16px" >
                            View all trees
                        </q-tooltip>
                    </q-btn>
                </q-btn-group>
                <q-btn size="20px" round @click="reltablebuttons = !reltablebuttons;" color="primary text-green" icon="ion-md-grid" >
                    <q-tooltip content-class="bg-primary" content-style="font-size: 16px" >
                        Get Relation Tables
                    </q-tooltip>
                </q-btn>
            </q-page-sticky>
          

            <q-dialog v-model="searchDialog" seamless position="right" full-width>
                <grew-request-card :parentOnSearch="onSearch" :grewquery="$route.query.q || ''"></grew-request-card>
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
                    
                    <q-card-section>
                        <q-toggle v-model="robot.active" checked-icon="check" color="warning" label="Choose a custom import name?" unchecked-icon="clear"/>
                        <q-input v-show="robot.active" v-model="robot.name" label="Custom Name for non real user import" />
                    </q-card-section>

                    <q-card-section > 
                        <q-file v-model="uploadSample.attachment.file" label="Pick files" outlined  use-chips clearable :loading="uploadSample.submitting" multiple style="max-width: 400px">
                            <template v-slot:after >
                                <q-btn color="primary" dense icon="cloud_upload" round @click="upload()" :loading="uploadSample.submitting" :disable="uploadSample.attachment.file == null"/>
                            </template>
                        </q-file>
                    </q-card-section>
                </q-card>
            </q-dialog>

            <q-dialog v-model="resultSearchDialog" transition-show="fade" transition-hide="fade" >
                <result-view :searchresults="resultSearch" :totalsents="infos.number_sentences" searchscope="project" ></result-view>
            </q-dialog>

            <q-dialog v-model="relationTableDial" transition-show="fade" transition-hide="fade" >
                <relation-table :edges="relationTableInfos" ></relation-table>
            </q-dialog>

            <q-dialog v-model="projectSettingsDial" transition-show="slide-up" transition-hide="slide-down" >
                <project-settings-view :projectname="$route.params.projectname" style="width:90vw"></project-settings-view>
            </q-dialog>

            <q-dialog v-model="simpleProjectInfoDialog">
                <q-card style="width: 300px">
                    <q-card-section>
                    <div class="text-h6">Project Information</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                        <div v-if="infos.admins.length>1">Contact these project administrators if you need access or further information:</div>
                        <div v-else>Contact the project administrator if you need access or further information:</div>
                    </q-card-section>
                    <q-card-section>
                        <q-list >
                            <q-item v-for="admin in infos.admins" :key="admin"  >
                                <q-item-label caption>{{admin}}</q-item-label>
                            </q-item>
                        </q-list>
                    </q-card-section>
                    <q-card-actions align="right" class="bg-white text-teal">
                        <q-btn flat label="OK" v-close-popup />
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <q-dialog v-model="confirmActionDial"> <confirm-action :parentAction="confirmActionCallback" :arg1="confirmActionArg1"></confirm-action> </q-dialog>




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
import TagInput from '../components/TagInput';
import ProjectSettingsView from '../components/ProjectSettingsView.vue';
import ConfirmAction from '../components/ConfirmAction';

export default {
    components: {
        GrewRequestCard, ResultView, RelationTable, UserTable, TagInput, ProjectSettingsView, ConfirmAction
    },
    data(){
        return {
            tab: 'texts',
            btnTopClass: this.$q.dark.isActive?'white':'blue-grey-8',
            assignDial: false,
            uploadDial: false,
            searchDialog: false,
            reltablebuttons: false,
            projectSettingsDial: false,
            simpleProjectInfoDialog: false,
            maximizedUploadToggle: false,
            resultSearchDialog: false,
            relationTableDial: false,
            confirmActionDial: false,
            confirmActionCallback: null,
            confirmActionArg1: '',
            alerts: { 
                'uploadsuccess': { color: 'positive', message: 'Upload success'},
                'uploadfail': { color: 'negative', message: 'Upload failed', icon: 'report_problem' },
                'deletesuccess': { color: 'positive', message: 'Delete success'},
                'deletefail': { color: 'negative', message: 'Delete failed', icon: 'report_problem'}
            },
            infos: {
                name: '',
                is_private: false,
                is_open: false,
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
                    { name: 'annotators', label: 'Annotators', sortable: true, field: 'roles.annotator' },
                    { name: 'validators', label: 'Validators', sortable: true, field: 'roles.validator' },
                    { name: 'profs', label: 'Profs', sortable: true, field: 'roles.prof' },
                    { name: 'treesFrom', label: 'Trees From', sortable: true, field: 'treesFrom' },
                    { name: 'exo', label: 'Exo', sortable: true, field: 'exo' }
                ],
                visibleColumns: ['samplename', 'annotators', 'validators', 'treesFrom', 'tokens', 'sentences'],
                filter: '',
                selected: [],
                loading: false,
                pagination: {
                    sortBy: 'name',
                    descending: false,
                    page: 1,
                    rowsPerPage: 10
                },
                loadingDelete: false,
                exporting: false
            },
            uploadSample: {
                submitting: false,
                attachment: { name: null, file: null}
            },
            resultSearch: {},
            relationTableInfos: {},
            window: {width: 0, height: 0 },
            possiblesUsers: [],
            tagContext: {},
            tableKey: 0,
            initLoad: false,
            robot: {active:false, name:'parser'},
            


        }
    },
    created() { window.addEventListener('resize', this.handleResize); this.handleResize(); },
    destroyed() { window.removeEventListener('resize', this.handleResize)},
    mounted(){
        this.getProjectInfos();
        this.getUsers();
        document.title = this.$route.params.samplename+" 🌳 Arborator-Grew 🌳 Sample of the "+this.$route.params.projectname+" project";
        if(this.$route.query.q && this.$route.query.q.length>0) this.searchDialog=true;
        },
    computed: {
        routePath() { return this.$route.path; },
        breakpoint(){ return this.window.width <= 400; },
        guest(){ return this.infos.guests.includes(this.$store.getters.getUserInfos.id); },
        admin(){ return this.infos.admins.includes(this.$store.getters.getUserInfos.id); },
        super_admin(){ return this.$store.getters.getUserInfos.super_admin; },

        
        
        noselect(){ return this.table.selected.length < 1;},
        loggedWithGithub() {
            var authProvider = this.$store.getters.getUserInfos.auth_provider;
            return authProvider == 4
        }, 
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        }, 
        avatar() {
            if (this.$store.getters.getUserInfos.picture_url) return this.$store.getters.getUserInfos.picture_url
            return "perm_identity";
        }, 
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
        getProjectInfos(){ 
            this.table.loading = true; 
            api.getProjectInfos(this.$route.params.projectname).then(response => 
                { 
                    this.infos = response.data; this.initLoad = true; 
                    this.table.loading = false;
                    document.title = this.$route.params.projectname+" 🌳 Arborator-Grew 🌳 Project with "+this.infos.number_sentences+" sentences in "+this.infos.samples.length+" samples";
                    // console.log('ààà',this.infos.admins)
                }).catch(error => {this.$store.dispatch("notifyError", {error: error}); this.table.loading = false;}); },
        getUsers(){ api.getUsers().then( response => {  
                for(let name of response.data.map(a => a.username)){ this.possiblesUsers.push( {key:name, value:name} ); }
            }).catch(error => {  this.$store.dispatch("notifyError", {error: error}) });
        },
        upload(){
            var form = new FormData();
            form.append('robotname', this.robot.name);
            form.append('robot', this.robot.active);
            this.uploadSample.submitting = true;
            for(const file of this.uploadSample.attachment.file){ form.append('files',file); }
            form.append('import_user',Store.getters.getUserInfos.username);
            api.uploadSample(this.$route.params.projectname, form).then( response => { 
                this.uploadSample.attachment.file = []; 
                this.getProjectInfos(); 
                this.uploadDial = false; 
                this.uploadSample.submitting = false; 
                this.showNotif('top-right', 'uploadsuccess');})
                .catch(error => { 
                    this.uploadSample.submitting = false; 
                    this.uploadDial = false; 
                    this.$store.dispatch("notifyError", {error: error}); });
        },
        onFileChange(event) { this.uploadSample.attachment.file = event.target.files; },
        deleteSamples(){
            for (const sample of this.table.selected) {
                api.deleteSample(this.infos.name, sample.samplename).then( response => { this.infos = response.data; this.table.selected = []; this.showNotif('top-right', 'deletesuccess'); } ).catch(error => {  this.$store.dispatch("notifyError", {error: error})  });
            }
        },
        commit(type) {
            var x = [];
            for (const sample of this.table.selected) { x.push(sample.samplename) }
            var data = { samplenames: x, commit_type:type};
            console.log(data);
            api.commit(this.$route.params.projectname, data)
            .then(response => {console.log("wooohoo");})
            .catch(error => {this.$store.dispatch("notifyError", {error: error}); })
        },
        pull(type) {
        var x = [];
        for (const sample of this.table.selected) { x.push(sample.samplename) }
        var data = { samplenames: x, pull_type:type};
        console.log(data);
        api.pull(this.$route.params.projectname, data)
        .then(response => {console.log("wooohoo");})
        .catch(error => {this.$store.dispatch("notifyError", {error: error}); })
            },
        exportSamplesZip(){
            this.table.exporting = true;
            var samplenames = [];
            for (const sample of this.table.selected) { samplenames.push(sample.samplename) }
            api.exportSamplesZip(samplenames, this.$route.params.projectname).then( response => {
                const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/zip" }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'dump_'+this.$route.params.projectname+'.zip');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.table.exporting = false;
                this.$q.notify({message:`Files downloaded`});
                return [];
            }).catch(error => {
                this.table.exporting = false;
                // this.$q.notify({message:`${error}`, color:'negative'});
                this.$store.dispatch("notifyError", {error: error});
                return [];
            });
        },
        getRelationTable(type) {
            // var data = { table_type:type};
            // console.log(type, data);
            var data = {table_type:type};
            api.getRelationTable(this.$route.params.projectname, data).then(response => {
                this.relationTableInfos = response.data;
                this.relationTableDial = true;
            }).catch(error => {  this.$store.dispatch("notifyError", {error: error}) });
        },
        onSearch(searchPattern){
            var query = { pattern: searchPattern };
            api.searchProject(this.$route.params.projectname, query)
            .then(response => {
                this.resultSearchDialog = true;
                this.resultSearch = response.data;
            }).catch(error => {  this.$store.dispatch("notifyError", {error: error})  });
        },
        // grewquery() {
        //     console.log('projectview',this.grewqueryc)
        //     if (this.grewqueryc==0) return 
        //     this.grewqueryc++;
        //     // if(this.$route.query.q && this.$route.query.q.length>0) this.searchDialog=true;
        // },
        /**
         * Used to update tags and table view based on response
         * @param response : the response from backend
         * @param samplename : the sample name to find
         */
        updateTags(response, samplename, target){
            for(let [i, sample] of this.infos.samples.entries()){ if(sample.samplename == samplename ){ this.infos.samples[i]["roles"] = response.data["roles"]; } }
            this.tableKey++;
            // this.$refs.textsTable.requestServerInteraction(this.table.pagination);
        },
        reverseTags(value, samplename, target){
            for(let [i, sample] of this.infos.samples.entries()){ 
                if(sample.samplename == samplename ){ 
                    var res = this.infos.samples[i]["roles"][target].filter(name => name.key != value);
                    this.infos.samples[i]["roles"][target] = res;
                }
            }
            this.tableKey++;
        },
        addAnnotator(slug, context){ 
            api.addSampleAnnotator(slug.value, this.$route.params.projectname, context.samplename).then(response => { this.updateTags(response, context.samplename); this.$q.notify({message:`Change saved!`});}).catch(error => { 
                this.reverseTags(slug.value, context.samplename, 'annotator'); this.$store.dispatch("notifyError", {error: error})  });
        },
        removeAnnotator(slug, context){ 
            api.removeSampleAnnotator(slug.value, this.$route.params.projectname, context.samplename).then(response => {
                this.updateTags(response, context.samplename); this.$q.notify({message:`Change saved!`});
            }).catch(error => {  this.$store.dispatch("notifyError", {error: error})  });
        },
        addValidator(slug, context){ api.addSampleValidator(slug.value, this.$route.params.projectname, context.samplename).then(response => { this.updateTags(response, context.samplename); this.$q.notify({message:`Change saved!`}); }) },
        removeValidator(slug, context){ api.removeSampleValidator(slug.value, this.$route.params.projectname, context.samplename).then(response => { this.updateTags(response, context.samplename); this.$q.notify({message:`Change saved!`}); }) },
        addSuperValidator(slug, context){ api.addSampleSuperValidator(slug.value, this.$route.params.projectname, context.samplename).then(response => { this.updateTags(response, context.samplename); }) },
        removeSuperValidator(slug, context){ api.removeSampleSuperValidator(slug.value, this.$route.params.projectname, context.samplename).then(response => { this.updateTags(response, context.samplename); }) },
        addProf(slug, context){ api.addSampleProf(slug.value, this.$route.params.projectname, context.samplename).then(response => { this.updateTags(response, context.samplename); }) },
        removeProf(slug, context){ api.removeSampleProf(slug.value, this.$route.params.projectname, context.samplename).then(response => { this.updateTags(response, context.samplename); }) },
        triggerConfirm(method, arg){
			this.confirmActionDial = true;
			this.confirmActionCallback = method;
			this.confirmActionArg1 = arg;
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
    min-height 20vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color $grey-1 /* #eeeeee */

  thead tr:first-child th
    position sticky
    top 0
    opacity 1
    z-index 2
.my-sticky-header-table-dark
  /* max height is important */
  .q-table__middle
    max-height 70vh
    min-height 20vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color $black-1 /* #eeeeee */

  thead tr:first-child th
    position sticky
    top 0
    opacity 1
    z-index 2
</style>