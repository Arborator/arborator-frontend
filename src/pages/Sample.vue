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
        <q-page-sticky class="flex flex-center column" :position="breakpoint?'bottom-right':'top-right'" :offset="breakpoint?[18, 18]:[18,70]" size="xs">
           <br/><br/>
            <q-btn fab :icon="searchDialog?'clear':'search'" color="primary" @click="searchDialog = !searchDialog"> <q-tooltip>Search in this sample</q-tooltip> </q-btn>
                        <!-- <q-btn push color="primary" :disable="!LoggedWithGithub" label="Pull" @click="pullSample()"/> -->

        </q-page-sticky>
        <q-dialog v-model="searchDialog" seamless position="right" >
            <grew-request-card :parentOnSearch="onSearch" ></grew-request-card>
        </q-dialog>

        <q-dialog v-model="resultSearchDial" transition-show="fade" transition-hide="fade" >
            <result-view :searchresults="resultSearch" :totalsents="sentenceCount" searchscope="sample" ></result-view>        </q-dialog>

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
            resultSearchDial: false,
            resultSearch: {},
            samples: {},
            samplesFrozen: {'list':[], 'indexes':{}},
            window: {width: 0,height: 0},
            virtualListIndex: 15,
            intri: 10 // give the scroll 10 seconds
        }
    },
    computed: {
        sentenceCount() {return Object.keys(this.samples).length},
        breakpoint(){ return this.window.width <= 400; },
        
        
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
            // console.log("***scrolala") && this.$route.params.user!=undefined
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
        ooo(){
          console.log('click');   // ,this.$refs['sc555']
        },
        onSearch(searchPattern){
            var query = { pattern: searchPattern };
            api.searchSample(this.projectname, this.samplename, query)
            .then(response => { this.resultSearch = response.data; this.resultSearchDial = true; })
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

