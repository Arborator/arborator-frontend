<template>
    <div class="sentencebox">
      <svg :id="id" :ref="id"></svg>
      
      
      <q-dialog        
        v-model="relDialog"
        :maximized="maximizedToggle"
        @hide="ondialoghide()"
        @keyup.enter="onchangerel()"
      >
        <q-card style="height:300px">
          <q-bar class="bg-primary text-white">
                <div class="text-weight-bold">Select a relation</div>
                <q-space />
                <q-btn flat dense icon="close" v-close-popup/>
            </q-bar>

          <q-card-section style="height:200px">
            <v-select v-for="(relist, index) in options.relations" :key="index" v-model="infos.relation[index]" :options="relist" style="float:left; display:inline;width:150px;"></v-select>
          </q-card-section>
            <q-space />
            <q-card-actions >
              <q-btn @click="ondialoghide()" label="Cancel" v-close-popup  style="width: 45%; margin-left: auto;margin-right: auto;" />
              <q-btn color="primary" @click="onchangerel()" label="Ok" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            </q-card-actions>
        </q-card>
      </q-dialog>


      <q-dialog        
        v-model="catDialog"
        :maximized="maximizedToggle"
        @hide="ondialoghide()"
        @keyup.enter="onchangecat()"
      >
        <q-card  style="height:300px">
          <q-bar class="bg-primary text-white">
              <div class="text-weight-bold">Select a category</div>
              <q-space />
              <q-btn flat dense icon="close" v-close-popup/>
          </q-bar>
          <q-card-section style="height:200px">
            <q-select
                filled
                v-model="infos.category"
                :options="options.cats"
                label="Category"
                style="width: 250px"
              />
            </q-card-section>
         
          <q-separator/>
          <q-card-actions>
            <q-btn @click="ondialoghide()" label="Cancel" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            <q-btn color="primary" @click="onchangecat()" label="Ok" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />

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
import api from '../boot/backend-api';

Vue.component('v-select', vSelect);



export default {
    name:'conllGraph',
    props: ['conll', 'user', 'sentenceId', 'matches'],
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
                relations:[["subj", "comp", "vocative", "det", "dep", "mod", "conj", "cc", "parataxis", "fixed", "flat", "compound", "discourse", "dislocated", "goeswith", "orphan", "punct", "root"],[":aux",":caus",":cleft",":pred",":appos", ":obj", ":obl"],["@agent", "@appos", "@caus", "@expl", "@fixed", "@lvc","@pass", "@relcl", "@tense","@x"]],
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
        var svg=this.start(this.conll, this.matches, this.id, this.user);
    },
    methods: {
        up(dirty, redo) {
          // console.log(svg.tree)
          // console.log("NOW"); // when I open a sentence, when I click on OK after editing a category or a relation;
          // console.log("gonna emit ", this.draft, this.id);
          // console.log('conll', this.draft.getConll(this.snapInfos.s));
          // console.log(this.snapInfos.s.treedata);
          if(this.snapInfos.s != null){
            this.$emit('update-conll', {'draft': this.draft, 'svgid': this.id, 'dirty': dirty, 'redo': redo, 
            'conll': this.draft.getConll(this.snapInfos.s), 'user': this.user}); //emits to parent the id of the tree and a bunch of other stuff
          }
          },
        start(conllStr, matches, id){
            // document.getElementById(id) the 
            console.log('start matches', matches)
            if (this.user in matches) var usermatch = matches[this.user];
            else var usermatch = {'nodes':[],'edges':[]};
            var svg = this.draft.getSvg(conllStr, usermatch, id); // here is the conllstr
            svg.toggleRelDialog  = this.toggleRelDialog;
            svg.toggleCatDialog  = this.toggleCatDialog;
            svg.selectRel = this.selectRel; // update le svg avec les infos de this
            svg.selectCat = this.selectCat;
            svg.triggerRelationChange = this.triggerRelationChange;
            svg.triggerCategoryChange = this.triggerCategoryChange;
            this.up(false, false);
            return svg
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
        triggerRelationChange(s, snaprelation, govid, depid, relation){
          // called from snap
          // snaprelation.attr({class:"deprelselected"});
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
          console.log("here", depid, govid, relation);
          this.snapInfos = {s:s, snaprelation:snaprelation, depid:depid, govid:govid, relation:relation, relations: listRel};
          this.infos.relation = listRel;
          this.relDialog = !this.relDialog;
        },
        triggerCategoryChange(s, snapcat, depid, category){
          // called from snap
          // snapcat.attr({class:"catselected"});
          // relation="qsdwf:zsert@swxcv";
          this.snapInfos = {s:s, snapcat:snapcat, depid:depid, category:category};
          this.infos.category = category;
          // console.log("triggerCategoryChange1")

          this.catDialog = !this.catDialog;
          // console.log("triggerCategoryChange2")
        },
        onchangerel(){
          this.relDialog = !this.relDialog;
          this.draft.relationChanged(this.snapInfos.s, this.snapInfos.depid, this.snapInfos.govid, this.infos.relation.join(""));
          this.up(true, false);
        },
        onchangecat(){
          this.catDialog = !this.catDialog;
          this.draft.catChanged(this.snapInfos.s, this.snapInfos.depid, this.infos.category);
          this.up(true, false);
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