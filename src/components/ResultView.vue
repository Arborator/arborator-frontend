<template>
    <q-card style=" max-width: 100vw;">
        <q-bar class="bg-primary text-white">
            <q-icon name="img:../statics/svg/grew.svg" size="7rem" />
            <q-space />
            <div class="text-weight-bold">{{sentenceCount}} <span v-if="sentenceCount==1">result</span><span v-else>results</span> (of the {{totalsents}} <span v-if="totalsents==1">sentence</span><span v-else>sentences</span> in the {{searchscope}})</div>
            <q-space />
            <q-btn flat dense icon="close" v-close-popup/>
        </q-bar>
        <!-- <q-bar class="bg-primary text-white">
        <q-space />
        <div class="text-weight-bold">Results</div>
        <q-space />
        <q-btn flat dense icon="close" v-close-popup/>
        </q-bar> -->
        <q-card-section > 
            <div v-show="!loading" class="q-pa-md row q-gutter-md">
                <q-virtual-scroll :items="this.samplesFrozen.list" style="height: 80vh; width:90vw" :virtual-scroll-slice-size="5" :virtual-scroll-item-size="200">
                <template v-slot="{ item, index}">
                <sentence-card :key="index" :id="item[1]" :sample="searchresults[item[0]][item[1]]" :index="index" :sentenceId="item[1]" searchResult='searchResult'></sentence-card>
                </template>
                </q-virtual-scroll>
            </div>
            <div v-show="loading" class="q-pa-md row justify-center">
                <div class="col"><q-circular-progress indeterminate size="70px" :thickness="0.22" color="primary" :track-color="$q.dark.isActive?'grey':'grey-3'" /></div>
            </div>
        </q-card-section>
    </q-card>
</template>

<script>
import api from '../boot/backend-api';
import SentenceCard from './SentenceCard';
var heavyList = [];
// var heavyListSamples = [];
export default {
    components: {SentenceCard},
    props: ['searchresults', 'totalsents', 'searchscope'],

    data(){
        return {
            samplesFrozen: {'list':[], 'indexes':{}, 'samples':[]},
            loading: false,
            inResult: true,
        }
    },
    computed: { sentenceCount() {return Object.keys(this.searchresults).length;}  },
    mounted(){
        this.freezeSamples();
        this.getProjectConfig();
    },
    methods: {
        freezeSamples() {
            console.log('samples to freeze', JSON.stringify(this.searchresults) );
            var listIds = []
            var index = 0;
            var index2Ids = {};
            for (let sampleId in this.searchresults) {             
                for (let sentId in this.searchresults[sampleId]) {
                    listIds.push([sampleId, sentId])
                    index2Ids[index] = [sampleId, sentId];
                    index++;
                }
            }
            heavyList = listIds;
            Object.freeze(heavyList);
            this.samplesFrozen = {'list': heavyList, 'indexes': index2Ids, };
        },
        getProjectConfig(){
            api.getProjectSettings(this.$route.params.projectname).then(response => { this.$store.commit('set_project_config', response.data); }).catch(error => { this.$store.dispatch("notifyError", {error: error}); });
        },
    }
}
</script>