<template>
    <q-page>
        <div class="q-pa-md row q-gutter-md">
            {{Object.keys(samples).length}} sentences
            <div class="col-12" v-for="(sample, index) in samples" :key="sample[Object.keys(sample)[0]]" :props="sample" >
                    <sentence-card :id="index" :sample="sample" :index="index" :sentenceId="index" ></sentence-card>
            </div>
        </div>

        <q-page-sticky position="bottom">
            <q-btn fab icon="search" color="primary" @click="searchDialog = true"/>
        </q-page-sticky>

        <q-dialog v-model="searchDialog" seamless position="bottom" style="width: 175em">
            <q-card style="width: 100%">
                
                <q-card-section class="row items-center no-wrap">
                    <q-form @submit="onSearch" @reset="onResetSearch" class="q-gutter-md" >
                    <div class="row">
                        <div class="col">
                        <q-input filled v-model="searchPattern" label="Search query" type="textarea" hint="Grew query syntax" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" />
                        <q-space />
                        <q-btn flat round type="submit" icon="search" />
                        <q-btn flat round type="reset" label="reset" />
                        <q-btn flat round icon="close" v-close-popup />
                        </div>
                        <div class="col">
                            <q-list bordered separator>
                                <q-item v-for="query in queries" :key="query.name" clickable v-ripple @click="changeSearchPattern(query.pattern)">
                                    <q-item-section>
                                        {{query.name}}
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </div>
                    </div>
                    </q-form>
                </q-card-section>
                
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script>

import Vue from 'vue'
Vue.config.ignoredElements = ['conll'];
import { openURL } from 'quasar'
import api from '../boot/backend-api';
import Store from '../store/index';
import SentenceCard from '../components/SentenceCard'

export default {
    components: {
        SentenceCard
    },
    props:['name', 'sample'],
    data(){
        return {
            svg: '',
            tab: 'gold',
            searchDialog: false,
            searchPattern: 'pattern { N [upos=\"NUM\"] }',
            samples: {},
            queries: [ {name:'PoS query', pattern:'pattern { N [upos=\"NUM\"] }'}, {name:'form query', pattern:'pattern { N [form=\"well\"] }'} ]
        }
    },
    computed: {
        contentSize () {
        return this.moreContent ? 150 : 5
        }
    },
    mounted(){
        // this.start('#youhou')
        this.getSampleContent();
    },
    methods: {
        start(id){
            // var draft = new ArboratorDraft();
            // var svg = draft.getSvg(this.test, id);
        },
        getSampleContent(){
            api.getSampleContent(this.name, this.sample)
            .then( response => { console.log(response.data); this.samples = response.data })
            .catch(error => {console.log(error)});
        },
        onSearch(){
            var query = { pattern: this.searchPattern };
            api.search(this.name, query)
            .then(response => { 
                console.log(response);
                this.samples.filter;
                var allowed = Object.keys(response.data.matches);
                console.log('allowed', allowed);
                var keys = Object.keys(this.samples);
                for(let i = 0; i < Object.keys(this.samples).length; i++){
                    if(!allowed.includes(keys[i])){ 
                        delete this.samples[keys[i]]; 
                    }
                }
                // const filtered = Object.keys(this.samples)
                //     .filter(key => allowed.includes(key))
                //     .reduce((obj, key) => {
                //         obj[key] = this.samples[key];
                //         return obj;
                //     }, {});
                // console.log('filtered', filtered);
                // this.samples = filtered;
            })
            .catch(error => { console.log(error) })
        },
        changeSearchPattern(pattern) {
            this.searchPattern = pattern;
        },
        onResetSearch(){
            this.searchPattern = '';
        }
    }
}
</script>