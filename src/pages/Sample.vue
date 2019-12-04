<template>
    <q-page>
        <div class="q-pa-md q-gutter-sm">
            <q-breadcrumbs>
                <q-breadcrumbs-el icon="home" to="/" />
                <q-breadcrumbs-el :label="projectname" icon="work" :to="'/projects/'+projectname" />
                <q-breadcrumbs-el :label="samplename" icon="assignment" :to="'/projects/'+projectname+'/'+samplename" />
            </q-breadcrumbs>
        </div>

        <div v-show="!loading" class="q-pa-md row q-gutter-md">
            <q-badge color="blue">{{sentenceCount}} sentences</q-badge>
            <q-virtual-scroll :items="this.samplesFrozen.list" style="max-height: 80vh; width:99vw" :virtual-scroll-slice-size="5" :virtual-scroll-item-size="200">
                <template v-slot="{ item, index }">
                    <sentence-card :key="index" :id="item" :sample="samples[item]" :index="index" :sentenceId="item" ></sentence-card>
                </template>
            </q-virtual-scroll>
        </div>
        <div v-show="loading" class="q-pa-md row justify-center">
            <div v-show="loading" class="col"><q-circular-progress  indeterminate size="70px" :thickness="0.22" color="primary" track-color="grey-3" /></div>
        </div>

        <q-page-sticky position="bottom">
            <q-btn fab icon="search" color="primary" @click="searchDialog = true"/>
        </q-page-sticky>

        <q-dialog v-model="searchDialog" seamless position="bottom" >
            <grew-request-card :parentOnSearch="onSearch" ></grew-request-card>
        </q-dialog>

        <q-dialog v-model="resultSearchDial" maximized transition-show="fade" transition-hide="fade" >
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
            samplesFrozen: {'list':[], 'indexes':{}}
        }
    },
    computed: {
        sentenceCount() {return Object.keys(this.samples).length}
    },
    mounted(){
        this.getSampleContent();
    },
    methods: {
        getSampleContent(){
            this.loading = true;
            api.getSampleContent(this.projectname, this.samplename)
            .then( response => { this.samples = response.data; this.frozeSamples(); this.loading = false; })
            .catch(error => {console.log(error); this.loading = false;});
        },
        onSearch(searchPattern){
            var query = { pattern: searchPattern };
            api.searchSample(this.projectname, this.samplename, query)
            .then(response => { this.resultSearch = response.data; this.resultSearchDial = true; })
            .catch(error => { console.log(error) })
        },
        closeSearchDialog(searchDialog){ searchDialog = this.searchDialog; },
        frozeSamples() {
            var index = 0; var listSamples = []; var index2sentId = {};
            for(let sentId in this.samples){ listSamples.push(sentId); index2sentId[index] = sentId; index++;}
            heavyList = listSamples;
            Object.freeze(heavyList);
            this.samplesFrozen = {'list': heavyList, 'indexes': index2sentId };
        }
    }
}

</script>

