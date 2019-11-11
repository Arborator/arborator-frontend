<template>
    <div class="sentencebox">
      <svg :id="id" :ref="id"></svg>
      
      
      <q-dialog        
        v-model="relDialog"
        :maximized="maximizedToggle"
        @hide="ondialoghide()"
        @keyup.enter="onchangerel()"
      >
      <!-- transition-hide="fade" -->
        <q-card class="bg-white text-black" style="height:300px">
          <!-- <q-bar>
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
          </q-bar> -->

          <!-- <q-card-section>
            <div class="text-h6">Relation selection</div>
          </q-card-section> -->

          <q-card-section style="height:200px">
            <v-select v-for="(relist, index) in options.relations" :key="index" v-model="infos.relation[index]" :options="relist" style="float:left; display:inline;width:150px"></v-select>
          </q-card-section>
          <!-- <q-bar> -->
            <q-space />
            <q-card-section >
              <q-btn class="primary" @click="ondialoghide()" label="Cancel" v-close-popup  style="width: 50%; margin-left: auto;margin-right: auto;" />
              <q-btn class="primary" @click="onchangerel()" label="Ok" v-close-popup style="width: 50%; margin-left: auto;margin-right: auto;" />
            </q-card-section>
          <!-- </q-bar> -->
        </q-card>
      </q-dialog>


      <q-dialog        
        v-model="catDialog"
        :maximized="maximizedToggle"
        @hide="ondialoghide()"
        @keyup.enter="onchangecat()"
      >
        <q-card class="bg-white text-black" style="height:300px">
          <q-card-section style="height:200px">
            <q-select
                filled
                v-model="infos.category"
                :options="options.cats"
                label="Category"
                style="width: 250px"
              />
           
                
              <!-- <v-select v-for="(catlist, index) in options.cats" :key="index" v-model="infos.cat[index]" :options="catlist" style="float:left; display:inline;width:150px"></v-select> -->
            </q-card-section>
            <q-card-section >
              <q-btn class="primary" @click="ondialoghide()" label="Cancel" v-close-popup style="width: 50%; margin-left: auto;margin-right: auto;" />
              <q-btn class="primary" @click="onchangecat()" label="Ok" v-close-popup style="width: 50%; margin-left: auto;margin-right: auto;" />
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
                category: null
            },
            options: {
                relations:[["subj", "comp", "vocative", "det", "dep", "mod", "conj", "cc", "parataxis", "fixed", "flat", "compound", "discourse", "dislocated", "goeswith", "orphan", "punct", "root"],[":aux",":caus",":cleft",":pred",":appos"],["@comp","@mod","@subj","@dep","@det"]],
		        cats:["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "VERB", "X"],
            },
            relDialog: false,
            catDialog: false,
            maximizedToggle: false,
            snapInfos: {
              s:null,
              snaprelation:null,
              snapcat:null,
              depid:null,
              govid:null,
              relation:'',
              relations: [],
              category:null
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
            svg.toggleRelDialog  = this.toggleRelDialog;
            svg.toggleCatDialog  = this.toggleCatDialog;
            svg.selectRel = this.selectRel;
            svg.selectCat = this.selectCat;
            svg.triggerRelationChange = this.triggerRelationChange;
            svg.triggerCategoryChange = this.triggerCategoryChange;
        },
        toggleRelDialog() {
            this.relDialog = !this.relDialog;
        },
         toggleCatDialog() {
            this.catDialog = !this.catDialog;
        },
        selectRel(currentRelation) {
            this.infos.relation = content;
        },
        selectCat(content) {
            this.infos.category = content;
        },
        // sendSelectedRel(){
        //     var relationStr = this.infos.relation.join("");
        //     this.draft.setRel(relationStr);
        // },
        triggerRelationChange(s, snaprelation, depid, govid, relation){
          // called from snap
          snaprelation.attr({class:"deprelselected"});
          // relation="qsdwf:zsert@swxcv";
          const splitters = /[:@]/g  // à mettre comme paramètre
          var splitIndeces = [...relation.matchAll(splitters)].map(x => x.index)
          var listRel = [];
          var lasti = 0
          for (let i of splitIndeces)
            { 
              listRel.push(relation.substring(lasti,i)); 
              lasti=i;
            }
          listRel.push(relation.substring(lasti)); 
          this.snapInfos = {s:s, snaprelation:snaprelation, depid:depid, govid:govid, relation:relation, relations: listRel};
          this.infos.relation = listRel;
          this.relDialog = !this.relDialog;
        },
        triggerCategoryChange(s, snapcat, depid, category){
          // called from snap
          snapcat.attr({class:"catselected"});
          // relation="qsdwf:zsert@swxcv";
           
          this.snapInfos = {s:s, snapcat:snapcat, depid:depid, category:category};
          this.infos.category = category;
          this.catDialog = !this.catDialog;
        },
        onchangerel(){
          this.relDialog = !this.relDialog;
          this.draft.relationChanged(this.snapInfos.s, this.snapInfos.depid, this.snapInfos.govid, this.infos.relation.join(""));
        },
        onchangecat(){
          this.catDialog = !this.catDialog;
          console.log("çççç",this.snapInfos.depid, this.infos.category)
          this.draft.catChanged(this.snapInfos.s, this.snapInfos.depid, this.infos.category);
        },
        ondialoghide(){
          if ('snaprelation' in this.snapInfos) this.snapInfos.snaprelation.attr({class:"deprel"});
          if ('snapcat' in this.snapInfos) this.snapInfos.snapcat.attr({class:"cat"});
        }
    }
}

// const catchEnterKey = evt => {
//     if (evt.which === 13 || evt.keyCode === 13) {
//       dialog.close()
//     }
//   }
// window.addEventListener('keyup', catchEnterKey)

// const dialog = Dialog.create({
//   ...........,
//   onDismiss: () => { window.removeEventListener('keyup', catchEnterKey) }
// })

</script>