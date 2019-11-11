<template>
    <div class="sentencebox">
    <svg :id="id"></svg>


    <q-dialog
      v-model="relDialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-white text-black">
        <q-bar>
          <q-space />

          <q-btn dense flat icon="minimize" @click="maximizedToggle = false" :disable="!maximizedToggle">
            <q-tooltip v-if="maximizedToggle" content-class="bg-white text-primary">Minimize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="crop_square" @click="maximizedToggle = true" :disable="maximizedToggle">
            <q-tooltip v-if="!maximizedToggle" content-class="bg-white text-primary">Maximize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <div class="text-h6">Relation selection</div>
        </q-card-section>

        <q-card-section>
            <v-select v-for="(relist, index) in options.relations" :key="index" v-model="infos.relation[index]" :options="relist"></v-select>
            <q-btn class="primary" @click="sendSelectedRel()" label="Ok" />
        </q-card-section>
      </q-card>
    </q-dialog>


    </div>

    <!-- <div :id="id" v-html="svgContent"></div> -->
</template>

<script>
import Vue from 'vue'
Vue.config.ignoredElements = ['conll'];
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css';

Vue.component('v-select', vSelect);
export default {
    name:'conllGraph',
    props: ['conll', 'user', 'sentenceId'],
    data(){
        return {
            draft: new ArboratorDraft(),
            id: this.user+'_'+this.sentenceId.replace(/\W/g, ''),
            svgContent: '',
            infos: {
                relation: [],
                category: ''
            },
            options: {
                relations:[["subj", "comp", "vocative", "det", "dep", "mod", "conj", "cc", "parataxis", "fixed", "flat", "compound", "discourse", "dislocated", "goeswith", "orphan", "punct", "root"],[":aux",":caus",":cleft",":pred",":appos"],["@comp","@mod","@subj","@dep","@det"]],
		        cats:["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "VERB", "X"],
            },
            relDialog: false,
            maximizedToggle: false

        }
    },
    mounted(){
        this.start(this.conll, this.id);
    },
    methods: {
        start(conllStr, id){
            console.log('conllStr conllGraph component', document.getElementById(id))
            var svg = this.draft.getSvg(conllStr, id);
            svg.gael = 17;
            svg.toggleRelDialog  = this.toggleRelDialog;
            svg.selectRel = this.selectRel;
            svg.selectCat = this.selectCat;
            
            // this.svgContent = svg['svg'];
            // $('#'+id).attr("display", "inline");
            // console.log("selected", this.$refs[id]);
        },
        toggleRelDialog() {
            this.relDialog = !this.relDialog;
        },
        selectRel(currentRelation) {
            this.infos.relation = content;
        },
        selectCat(content) {
            this.infos.category = content;
        },
        sendSelectedRel(){
            var relationStr = this.infos.relation.join("");
            this.draft.setRel(relationStr);
        }
    }
}
</script>