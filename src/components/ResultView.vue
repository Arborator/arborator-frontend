<template>
    <q-card style=" max-width: 100vw;">
        <q-bar class="bg-primary text-white">
            <q-space />
            <div class="text-weight-bold">Results</div>
            <q-space />
            <q-btn flat dense icon="close" v-close-popup/>
        </q-bar>
        <q-card-section > 
            <div v-show="!loading" class="q-pa-md row q-gutter-md">
                <q-badge color="secondary">{{sentenceCount}} sentences found</q-badge>
                <q-virtual-scroll :items="this.samplesFrozen.list" style="height: 80vh; width:90vw" :virtual-scroll-slice-size="5" :virtual-scroll-item-size="200">
                    <template v-slot="{ item, index }">
                        <sentence-card :key="index" :id="item" :sample="searchresults[item]" :index="index" :sentenceId="item" ></sentence-card>
                    </template>
                </q-virtual-scroll>
            </div>
            <div v-show="loading" class="q-pa-md row justify-center">
                <div class="col"><q-circular-progress  indeterminate size="70px" :thickness="0.22" color="primary" :track-color="$q.dark.isActive?'grey':'grey-3'" /></div>
            </div>
        </q-card-section>
    </q-card>
    
</template>

<script>
import SentenceCard from './SentenceCard';
var heavyList = [];
export default {
    components: {SentenceCard},
    props: ['searchresults'],
    data(){
        return {
            samplesFrozen: {'list':[], 'indexes':{}},
            loading: false
        }
    },
    computed: { sentenceCount() {return Object.keys(this.searchresults).length;}  },
    mounted(){this.freezeSamples();},
    methods: {
        freezeSamples() {
            console.log('samples', this.searchresults);
            var index = 0; var listSamples = []; var index2sentId = {};
            for(let sentId in this.searchresults){ listSamples.push(sentId); index2sentId[index] = sentId; index++;}
            heavyList = listSamples;
            Object.freeze(heavyList);
            this.samplesFrozen = {'list': heavyList, 'indexes': index2sentId };
        }
    }
}
</script>