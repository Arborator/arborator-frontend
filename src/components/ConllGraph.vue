<template>
    <div class="sentencebox">
      <svg :id="id" :ref="id"></svg>


      <q-dialog
        v-model="relDialog"
        persistent
        :maximized="maximizedToggle"
        transition-show="fade"
        transition-hide="fade"
      >
        <q-card class="bg-white text-black" style="width: 100%">
          <q-bar class="bg-primary text-white">
            <div class="text-weight-bold">Tag Window</div>
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
            <div class="text-h6 text-primary">Relation selection</div>
          </q-card-section>

          <q-card-section>
              <div class="q-pa-md row items-start q-gutter-md">
                <v-select v-for="(relist, index) in options.relations" :key="index" v-model="infos.relation[index]" :options="relist"></v-select>
              </div>
          </q-card-section>
          <q-separator/>
          <q-card-actions>
            <q-btn color="primary" @click="triggerChangeRel()" label="Ok" v-close-popup/>
          </q-card-actions>
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
            maximizedToggle: false,
            snapInfos: {
              s:null,
              devid:null,
              govid:null,
              relation:'',
              relations: []
            }
            
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
            svg.triggerRelationChange = this.triggerRelationChange;
            
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
        },
        triggerRelationChange(s, depid, govid, relation){
          // from snap
          var elements = relation.split(/[:@]/);
          var chars = relation.split('');
          var separators = [];
          var listSeps = [':', '@'];
          // for (var i = 0; i<chars.length ; i++){ 
          //   // if(listSeps.includes(chars[i])) 
          //   console.log('youhou', chars[i]);
          //     // separators.push(chars[i]); 
          // }
          for (var i = 0; i<chars.length ; i++){ 
            if(/[:@]/.test(chars[i])) 
              separators.push(chars[i]); 
          }
          console.log(separators , 'separators');
          var listRel = [];
          for (var i = 0; i<elements.length; i++){ listRel.push(elements[i]); }
          this.snapInfos = {s:s, depid:depid, govid:govid, relation:relation, relations: listRel};
          this.infos.relation = listRel;
          this.relDialog = !this.relDialog;
        },
        triggerChangeRel(){
          this.draft.relationChanged(this.snapInfos.s, this.snapInfos.depid, this.snapInfos.govid, this.infos.relation.join(""));
        }
    }
}
</script>