<template>
    <q-page :class="$q.dark.isActive?'bg-dark':'bg-grey-1'">
        <div v-show="!loading" class="q-pa-md row q-gutter-md">
            <!-- <q-btn flat round dense icon="ion-md-git-commit"  @click="commit()" color="primary"> <q-tooltip>Commit this sample</q-tooltip> </q-btn> -->
            <!-- <q-btn flat round dense icon="save"  @click="commit()" color="primary"> <q-tooltip>Commit this sample</q-tooltip> </q-btn> -->
            <!-- <q-badge @click="ooo()" color="primary">{{sentenceCount}} sentences {{this.$route.params.nr}}{{this.$route.params.user}}</q-badge> in -->
             <!-- {{scro}} -->
            <!-- <q-btn push color="primary" :disable="!LoggedWithGithub" label="Commit" @click="commit()"/> -->
            <!-- <ion-icon name="git-commit-outline"></ion-icon> -->
            <!-- <q-btn push color="primary" :disable="!LoggedWithGithub" label="Pull" @click="pullSample()"/> -->
            <q-virtual-scroll ref="virtualListRef" :items="this.samplesFrozen.list" style="max-height: 95vh; width:99vw" :virtual-scroll-slice-size="7" :virtual-scroll-item-size="200">
                <template v-slot="{ item, index }">
                    <sentence-card :key="index" :ref="'sc'+index" :id="'sc'+index" :sample="samples[item]" :index="index" :sentenceId="item" ></sentence-card>
                </template>
            </q-virtual-scroll>
        </div>
        <div v-show="loading" class="q-pa-md row justify-center">
            <div class="absolute-center"><q-circular-progress  indeterminate size="70px" :thickness="0.22" color="primary" track-color="grey-3" /></div>
        </div>
    <!-- <q-btn-dropdown -->
        <!-- <q-page-sticky class="flex flex-center column" :position="breakpoint?'bottom-right':'top-right'" :offset="breakpoint?[18, 18]:[18,70]" size="xs">
           <br/><br/>
            <q-btn fab :icon="searchDialog?'clear':'search'" color="primary" @click="searchDialog = !searchDialog"> <q-tooltip>Search in this sample</q-tooltip> </q-btn>

        </q-page-sticky> -->

        <q-page-sticky :position="breakpoint?'bottom-right':'top-right'" :offset="breakpoint?[18, 18]:[18,70]">
                <q-btn size="20px" round @click="searchDialog = !searchDialog" color="primary" icon="img:../statics/svg/g.svg" >
                    <q-tooltip content-class="bg-primary" content-style="font-size: 16px" >
                         Search with Grew in this sample
                    </q-tooltip>
                </q-btn>
            </q-page-sticky>

            <q-page-sticky :position="breakpoint?'bottom-right':'top-right'" :offset="breakpoint?[18, 88]:[18,140]" style="z-index:999">
                    <q-btn-group push flat rounded v-if="reltablebuttons">
                    <q-btn @click="getRelationTable()" push color="primary" no-caps>
                        <q-tooltip content-class="bg-primary" content-style="font-size: 16px" >
                            View only my trees
                        </q-tooltip>
                        <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar"></q-avatar>
                        <q-icon v-else name="account_circle" /> 
                    </q-btn>
                    <q-btn @click="getRelationTable()" push color="primary" no-caps>
                        <q-tooltip content-class="bg-primary" content-style="font-size: 16px" >
                            View my trees, filled up with the most recent trees
                        </q-tooltip>
                        <q-avatar v-if="isLoggedIn" size="1.2rem"><img :src="avatar"></q-avatar>
                        <q-icon v-else name="account_circle" /> 
                        <div>+</div>
                    </q-btn>
                    <q-btn @click="getRelationTable()" push icon="ion-md-globe"  color="primary" no-caps v-if="admin || super_admin">
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

        <q-dialog v-model="searchDialog" seamless position="right"  full-width>
            <grew-request-card :parentOnSearch="onSearch" ></grew-request-card>
        </q-dialog>

        <q-dialog v-model="resultSearchDialog" transition-show="fade" transition-hide="fade" >
            <result-view :searchresults="resultSearch" :totalsents="sentenceCount" searchscope="sample" ></result-view>        
        </q-dialog>

       
    </q-page>
</template>

<script>

import Vue from 'vue'
Vue.config.ignoredElements = ['conll'];
import { openURL } from 'quasar'
import api from '../boot/backend-api';
import Store from '../store/index';
import SentenceCard from '../components/SentenceCard';
import GrewRequestCard from '../components/GrewRequestCard';
import ResultView from '../components/ResultView';

var heavyList = []

export default {
    components: {
        SentenceCard, GrewRequestCard, ResultView
    },
    props:['projectname', 'samplename','nr','user'],
    data(){
        return {
            svg: '',
            tab: 'gold',
            loading: false,
            searchDialog: false,
            resultSearchDialog: false,
            reltablebuttons: false,
            resultSearch: {},
            samples: {},
            samplesFrozen: {'list':[], 'indexes':{}},
            window: {width: 0,height: 0},
            virtualListIndex: 15,
            intri: 10, // give the scroll 10 seconds
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
        }
    },
    computed: {
        sentenceCount() {return Object.keys(this.samples).length},
        breakpoint(){ return this.window.width <= 400; },
        admin(){ return this.infos.admins.includes(this.$store.getters.getUserInfos.id); },
        super_admin(){ return this.$store.getters.getUserInfos.super_admin; },
        
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
    created() { window.addEventListener('resize', this.handleResize); this.handleResize(); },
    destroyed() { window.removeEventListener('resize', this.handleResize)},
    mounted(){ 
        this.getSampleContent(); 
        this.getProjectConfig();
        document.title = this.$route.params.samplename+" 🌳 Arborator-Grew 🌳 Sample of the "+this.$route.params.projectname+" project";
    },
    methods: {
        getProjectConfig(){
            api.getProjectSettings(this.$route.params.projectname).then(response => { this.$store.commit('set_project_config', response.data); }).catch(error => { this.$store.dispatch("notifyError", {error: error}); });
        },
        handleResize() {this.window.width = window.innerWidth; this.window.height = window.innerHeight;},
        getSampleContent(){
            this.loading = true;
            api.getSampleContent(this.projectname, this.samplename)
            .then( response => { 
                // console.log("samples (sample view)", 
                // response.data[Object.keys(response.data)[0]]); 
                this.samples = response.data; this.freezeSamples(); 
                this.loading = false;
                // console.log(777777,this.$route.params.nr in this.samples,this.$refs.virtualListRef)
                if (this.$refs && this.$refs.virtualListRef && this.$route.params.nr ) 
                    this.intr = setInterval( () => { this.scrolala()}, 1000 )
                
                }).catch(error => {this.$store.dispatch("notifyError", {error: error}); this.loading = false;});
        },
        scrolala(){
            // console.log("***scrolala", this.$route.params.user) //&& this.$route.params.user!=undefined
             if (!this.loading && this.$refs && this.$refs.virtualListRef && this.$route.params.nr!=undefined  && parseInt(this.$route.params.nr)<=this.samplesFrozen.list.length)
                    {
                        var id = parseInt(this.$route.params.nr)-1;
                        this.$refs.virtualListRef.scrollTo( id );
                        clearInterval(this.intr);
                        setTimeout( () => {
                                if ('sc'+id in this.$refs) this.$refs['sc'+id].autoopen(this.$route.params.user)
                            }, 2000 ) 
                    }
            this.intri--;
            if (!this.intri) clearInterval(this.intr);
        },
        
        onSearch(searchPattern){
            var query = { pattern: searchPattern };
            api.searchSample(this.projectname, this.samplename, query)
            .then(response => { this.resultSearch = response.data; this.resultSearchDialog = true; })
            .catch(error => {this.$store.dispatch("notifyError", {error: error}); })
        },
        closeSearchDialog(searchDialog){ searchDialog = this.searchDialog; },
        // commit() {
        //     api.commit(this.projectname, this.samplename)
        //     .then(response => {console.log("wooohoo");})
        //     .catch(error => {this.$store.dispatch("notifyError", {error: error}); })
        //     },
        pullSample() {
        api.pull(this.projectname, this.samplename)
        .then(response => {console.log("wooohoo");})
        .catch(error => {this.$store.dispatch("notifyError", {error: error}); })
            },
        freezeSamples() {
            var index = 0; var listSamples = []; var index2sentId = {};
            for(let sentId in this.samples){ listSamples.push(sentId); index2sentId[index] = sentId; index++;}
            heavyList = listSamples;
            Object.freeze(heavyList);
            this.samplesFrozen = {'list': heavyList, 'indexes': index2sentId };
        }
    }
}

</script>

