<template>
    <q-card style=" max-width: 100vw;">
        <q-bar class="bg-primary text-white">
            <q-space />
            <div class="text-weight-bold">Results</div>
            <q-space />
            <q-btn flat dense icon="close" v-close-popup/>
        </q-bar>
        
        <q-card-section > 
            <div class="q-pa-md row q-gutter-md">
                <div class="col-12" v-for="(sample, index) in searchresults.trees" :key="index" :props="sample" >
                    {{sample}}
                    {{searchresults.matches[index]}}
                        <!-- <sentence-card :id="index" :sample="sample.conll" :index="index" :sentenceId="index" :sentence="sample.sentence" :projectname="projectname" ></sentence-card> -->
                </div>
            </div>
        </q-card-section>
    </q-card>
    
</template>

<script>
import SentenceCard from './SentenceCard';
export default {
    components: {SentenceCard},
    props: ['searchresults'],
    data(){
        return {
            samples: this.searchResults
        }
    },
    methods: {

    }
}
</script>