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

        <q-dialog v-model="searchDialog" seamless position="bottom" >
            <q-card style="width: 100%">

                <q-bar class="bg-primary text-white">
                    <div class="text-weight-bold">Grew Matcher</div>
                    <q-space />
                    <q-btn flat dense icon="close" v-close-popup />
                </q-bar>
                
                <q-card-section>
                    <q-form @submit="onSearch" @reset="onResetSearch" class="q-gutter-md" >
                    <div class="q-pa-md">
                        <div class="row">
                            <div class="col">
                            <q-input filled v-model="searchPattern" label="Search query" type="textarea" hint="Grew query syntax" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']" />
                            <q-space />
                            <!-- <q-btn-group> -->
                                <q-btn color="primary" type="submit" label="Search" />
                            <!-- </q-btn-group> -->
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
            searchPattern: `% Search for a given word form
pattern { N [form="Form_to_search"] }`,
            samples: {},
            queries: [ 
                {name:'POS query', pattern:`% Search for a token of a given upos
% Available tags: ADJ, ADP, ADV, AUX, CONJ, DET, INTJ, NOUN, NUM, PART, PRON, PROPN, PUNCT, SCONJ, SYM, VERB, X

pattern { N [upos="NUM"] }`}, 
                {name:'Form query', pattern:`% Search for a given word form
pattern { N [form="Form_to_search"] }`},
                {name:'Lemma query', pattern:`% Search for a given lemma (lemmatization is not available for all languages)

pattern { N [lemma="Lemma_to_search"] }`},
                {name:'Dependency relation query', pattern:`% Search for a dependency relation
% Available relations are:
%   acl, acl:relcl, advcl, advmod, amod, appos, aux, aux:pass, case, cc, ccomp,
%   compound, conj, cop, csubj, dep, det, discourse, obj, expl, iobj, mark,
%   fixed, flat, neg, nmod, nmod:poss, nsubj, nsubj:pass, nummod, parataxis, punct, root, xcomp

pattern { GOV -[advcl]-> DEP }`},
                {name:'Relation and tags query', pattern:`% Search for a "det" dependency relation
% such that the governor's tag is different from NOUN, PROPN and ADJ

pattern {
  GOV [upos <> NOUN|ADJ|PROPN];
  GOV -[det]-> DEP;
}`}
            ]
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