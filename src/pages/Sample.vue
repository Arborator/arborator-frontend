<template>
    <q-page :class="$q.dark.isActive?'bg-dark':'bg-grey-1'">
        <div v-show="!loading" class="q-pa-md row q-gutter-md">
            <q-badge color="primary">{{sentenceCount}} sentences</q-badge>
            <q-btn push color="primary" label="Commit" @click="commit()"/>
            <q-btn push color="primary" label="Pull" @click="pullSample()"/>
            <q-virtual-scroll :items="this.samplesFrozen.list" style="max-height: 80vh; width:99vw" :virtual-scroll-slice-size="5" :virtual-scroll-item-size="200">
                <template v-slot="{ item, index }">
                    <sentence-card :key="index" :id="item" :sample="samples[item]" :index="index" :sentenceId="item" ></sentence-card>
                </template>
            </q-virtual-scroll>
        </div>
        <div v-show="loading" class="q-pa-md row justify-center">
            <div class="absolute-center"><q-circular-progress  indeterminate size="70px" :thickness="0.22" color="primary" track-color="grey-3" /></div>
        </div>

        <q-page-sticky :position="breakpoint?'bottom-right':'top-right'" :offset="breakpoint?[18, 18]:[18,70]">
            <q-btn fab :icon="searchDialog?'clear':'search'" color="primary" @click="searchDialog = !searchDialog"/>
        </q-page-sticky>

        <q-dialog v-model="searchDialog" seamless position="right" >
            <grew-request-card :parentOnSearch="onSearch" ></grew-request-card>
        </q-dialog>

        <q-dialog v-model="resultSearchDial" transition-show="fade" transition-hide="fade" >
            <result-view :searchresults="resultSearch"></result-view>
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
    props:['projectname', 'samplename'],
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
            window: {width: 0,height: 0}
        }
    },
    computed: {
        sentenceCount() {return Object.keys(this.samples).length},
        breakpoint(){ return this.window.width <= 400; } 
    },
    created() { window.addEventListener('resize', this.handleResize); this.handleResize(); },
    destroyed() { window.removeEventListener('resize', this.handleResize)},
    mounted(){ 
        this.getSampleContent(); 
        this.getProjectConfig();
    },
    methods: {
        getProjectConfig(){
            api.getProjectSettings(this.$route.params.projectname).then(response => { this.$store.commit('set_project_config', response.data); }).catch(error => { this.$store.dispatch("notifyError", {error: error}); });
        },
        handleResize() {this.window.width = window.innerWidth; this.window.height = window.innerHeight;},
        getSampleContent(){
            this.loading = true;
            api.getSampleContent(this.projectname, this.samplename)
            .then( response => { console.log("samples (sample view)", response.data[Object.keys(response.data)[0]]); this.samples = response.data; this.freezeSamples(); this.loading = false; })
            .catch(error => {this.$store.dispatch("notifyError", {error: error}); this.loading = false;});
        },
        onSearch(searchPattern){
            var query = { pattern: searchPattern };
            api.searchSample(this.projectname, this.samplename, query)
            .then(response => { this.resultSearch = response.data; this.resultSearchDial = true; })
            .catch(error => {this.$store.dispatch("notifyError", {error: error}); })
        },
        closeSearchDialog(searchDialog){ searchDialog = this.searchDialog; },
        commit() {
            api.commit(this.projectname, this.samplename)
            .then(response => {console.log("wooohoo");})
            .catch(error => {this.$store.dispatch("notifyError", {error: error}); })
            },
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

