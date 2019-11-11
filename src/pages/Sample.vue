<template>
    <q-page>
        <div class="q-pa-md q-gutter-sm">
            <q-breadcrumbs>
            <q-breadcrumbs-el icon="home" to="/" />
            <q-breadcrumbs-el :label="name" icon="work" :to="'/projects/'+name" />
            <q-breadcrumbs-el :label="sample" icon="assignment" :to="'/projects/'+name+'/'+sample" />
            </q-breadcrumbs>
        </div>
        <div class="q-pa-md row q-gutter-md">
            {{Object.keys(samples).length}} sentences
            <div class="col-12" v-for="(sample, index) in samples" :key="index" :props="sample" >
                    <sentence-card :id="index" :sample="sample.conlls" :index="index" :sentenceId="index" :sentence="sample.sentence" ></sentence-card>
            </div>
        </div>

        <q-page-sticky position="bottom">
            <q-btn fab icon="search" color="primary" @click="searchDialog = true"/>
        </q-page-sticky>

        <q-dialog v-model="searchDialog" seamless position="bottom" >
            <grew-request-card :parentOnSearch="onSearch" ></grew-request-card>
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

export default {
    components: {
        SentenceCard, GrewRequestCard
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
            .then( response => { this.samples = response.data })
            .catch(error => {console.log(error)});
        },
        onSearch(searchPattern){
            var query = { pattern: searchPattern };
            api.search(this.name, query)
            .then(response => { 
                console.log(response);
                // this.samples.filter;
                // var allowed = Object.keys(response.data.matches);
                // console.log('allowed', allowed);
                // var keys = Object.keys(this.samples);
                // for(let i = 0; i < Object.keys(this.samples).length; i++){
                //     if(!allowed.includes(keys[i])){ 
                //         delete this.samples[keys[i]]; 
                //     }
                // }

                // const filtered = Object.keys(this.samples)
                //     .filter(key => allowed.includes(key))
                //     .reduce((obj, key) => {
                //         obj[key] = this.samples[key];
                //         return obj;
                //     }, {});
                // console.log('filtered', filtered);
                // this.samples = filtered;

                this.samples = response.data.trees;
            })
            .catch(error => { console.log(error) })
        },
        closeSearchDialog(searchDialog){ searchDialog = this.searchDialog; }
    }
}

// {id:{user:conllStr}}

</script>

