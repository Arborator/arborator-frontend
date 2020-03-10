<template>
    <div class="sentencebox">
      <svg :id="id" :ref="id" :class="$q.dark.isActive?'dark':''"></svg>

      <q-dialog        
        v-model="relDialog"
        :maximized="maximizedToggle"
        @hide="ondialoghide()"
        @keyup.enter="onchangerel(false)"
      >
        <q-card style="height:300px">
          <q-bar class="bg-primary text-white">
                <div class="text-weight-bold">Select a relation</div>
                <q-space />
                <q-btn flat dense icon="close" v-close-popup/>
            </q-bar>

          <q-card-section style="height:200px">
            <v-select v-for="(relist, index) in options.relations" :key="index" v-model="infos.relation[index]" :options="relist" :class="$q.dark.isActive?'vs-dark':'vs-light'" style="float:left; display:inline;width:150px;"></v-select>
          </q-card-section>
            <q-space />
            <q-card-actions >
              <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup  style="width: 35%; margin-left: auto; margin-right: auto;" />
              <q-btn flat @click="onchangerel(true)" label="+" v-close-popup  style="width: 15%; margin-left: auto; margin-right: auto;">
                <q-tooltip >Add as extended relation</q-tooltip>
              </q-btn>
              <q-btn color="primary" @click="onchangerel(false)" label="Ok" v-close-popup style="width: 35%; margin-left: auto;margin-right: auto;" :disabled="emptyDeprel"/>
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
            <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            <q-btn color="primary" @click="onchangecat()" label="Ok" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" :disabled="emptyCat" />

          </q-card-actions>
        </q-card>
      </q-dialog>









       <q-dialog        
        v-model="featureDialog"
        :maximized="maximizedToggle"
        @hide="ondialoghide()"
        @keyup.enter="onchangefeature()"
        >
        <q-card  style="height:70vh">
          <q-bar class="bg-primary text-white">
              <div class="text-weight-bold">Select a category</div>
              <q-space />
              <q-btn flat dense icon="close" v-close-popup/>
          </q-bar>

          <q-card-section>
            <q-table
              title="Features"
              :data="featTable.featl"
              :columns="featTable.featcolumns"
              row-key="name"
              binary-state-sort
            >

              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="a" :props="props">
                    {{ props.row.a }}
                    <q-popup-edit v-model="props.row.a" title="Update Attribute" buttons>
                      <q-input v-model="props.row.a" dense autofocus counter />
                    </q-popup-edit>
                  </q-td>
                  <q-td key="v" :props="props">
                    {{ props.row.v }}
                    <q-popup-edit v-model="props.row.v" title="Update Value" buttons>
                      <q-input v-model="props.row.v" dense autofocus />
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>



        <!-- <q-card-section style="height:200px"> 
            <v-select v-for="(value, name) in options.featl" :key="name" v-model="infos.featl[name]" :options="featl" :class="$q.dark.isActive?'vs-dark':'vs-light'" style="float:left; display:inline;width:150px;"></v-select>
          </q-card-section>

          <q-card-section style="height:200px">
            <q-select
                filled
                v-model="infos.category"
                :options="options.cats"
                label="Category"
                style="width: 250px"
              />
            </q-card-section> -->
         
          <q-separator/>
          <q-card-actions align="around">
            <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            <q-btn color="primary" @click="onchangefeature()" label="Ok" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" :disabled="emptyCat" />
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
            loading: true,
            infos: {
                relation: [],
                category: null,
                feats: {},
                misc: {}
            },
            options: {
                relations:[["subj", "comp", "vocative", "det", "dep", "mod", "conj", "cc", "parataxis", "fixed", "flat", "compound", "discourse", "dislocated", "goeswith", "orphan", "punct", "root"],[":aux",":caus",":cleft",":pred",":appos", ":obj", ":obl"],["@agent", "@appos", "@caus", "@expl", "@fixed", "@lvc","@pass", "@relcl", "@tense","@x"]],
		            cats:["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "VERB", "X"]
            },
            relDialog: false,
            catDialog: false,
            featureDialog: false,
            maximizedToggle: false,
            snapInfos: {
              s:null,
              snaprelation:null,
              snapcat:null,
              depid:null,
              govid:null,
              relation:'',
              relations: [],
              feats: {},
              misc: {},
              category:null
            },
            featTable: {
              featl: [],
              featcolumns: [
                // {
                //   name: 'name',
                //   required: true,
                //   label: 'Features',
                //   align: 'left',
                //   field: row => row.name,
                //   format: val => `${val}`,
                //   sortable: true
                // },
                { name: 'a', align: 'center', label: 'Attribute', field: 'a', sortable: true },
                { name: 'v', label: 'Value', field: 'v', sortable: true }
              ]
            }         
        }
    },
    computed: {
      emptyCat(){ return this.infos.category == null || this.infos.category == ''; },
      emptyDeprel(){ return this.infos.relation.flat().length < 1 ; }
    },
    mounted(){
        var svg=this.start(this.conll, this.matches, this.id, this.user);
        this.getProjectConfig();
    },
    methods: {
        /**
         * replace the default labels and cats by the ones in the config if list not empty
         */
        getProjectConfig(){
          var conf = this.$store.getters.getProjectConfig;
          if(conf.cats.length > 1){ this.options.cats = conf.cats; }
          if(conf.labels.length > 1){ 
            var strStocks = [];
            for(let stock of conf.labels){  
              var strStockLabels = [];
              for(let label of stock.labels){ strStockLabels.push(label.value); }
              strStocks.push( strStockLabels );
            }
            this.options.relations = strStocks; 
          }
        },
        up(dirty, redo) {
          // console.log(svg.tree)
          // console.log("NOW"); // when I open a sentence, when I click on OK after editing a category or a relation;
          // console.log("gonna emit ", this.draft, this.id);
          // console.log('conll', this.draft.getConll(this.snapInfos.s));
          // console.log(this.snapInfos.s.treedata);
          if(this.snapInfos.s != null){
            this.$emit('update-conll', {'draft': this.draft, 'svgid': this.id, 
            'dirty': dirty, 
            'redo': redo, 
            'conll': this.draft.getConll(this.snapInfos.s), 
            'user': this.user}); //emits to parent the id of the tree and a bunch of other stuff
          }
          },
        start(conllStr, matches, id){
            // document.getElementById(id) the 
            // console.log('start matches', matches)
            if (this.user in matches) var usermatch = matches[this.user];
            else var usermatch = {'nodes':[],'edges':[]};
            var shownfeatures=["form", "upos", "lemma", "gloss"]; // TODO: à mettre dans le store
            var svg = this.draft.getSvg(conllStr, usermatch, id, shownfeatures); // here is the conllstr
            this.loading = false;
            svg.toggleRelDialog  = this.toggleRelDialog;
            svg.toggleCatDialog  = this.toggleCatDialog;
            svg.toggleFeatureDialog  = this.toggleFeatureDialog;
            svg.selectRel = this.selectRel; // update le svg avec les infos de this
            svg.selectCat = this.selectCat;
            svg.triggerRelationChange = this.triggerRelationChange;
            svg.triggerCategoryChange = this.triggerCategoryChange;
            svg.triggerFeatureChange = this.triggerFeatureChange;
            this.up(false, false);
            return svg
        },
        toggleRelDialog() {
            this.relDialog = !this.relDialog;
        },
        toggleCatDialog() {
            this.catDialog = !this.catDialog;
        },
        toggleFeatureDialog() {
            this.featureDialog = !this.featureDialog;
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
          if (relation=="_") relation="";
          var splitIndeces = [...relation.matchAll(splitters)].map(x => x.index)
          var listRel = [];
          var lasti = 0
          for (let i of splitIndeces)
            { 
              listRel.push(relation.substring(lasti,i)); 
              lasti=i;
            }
          listRel.push(relation.substring(lasti)); 
          // console.log("here", depid, govid, relation);
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
        triggerFeatureChange(s, snapcat, depid, feats, misc){
          // called from snap
          // snapcat.attr({class:"catselected"});
          // relation="qsdwf:zsert@swxcv";
          console.log(444,feats);
          var featl = [];
          for (let a in feats) { featl.push({'name':a+feats[a], 'a':a, 'v':feats[a]})}
          console.log(featl)
          this.snapInfos = {s:s, snapcat:snapcat, depid:depid, featl:featl, misc:misc};
          // this.infos.featl = featl;
          this.featTable.featl = featl;
          // console.log("triggerCategoryChange1")

          this.featureDialog = !this.featureDialog;
          console.log("triggerFeatureChange end")
        },
        onchangerel(addasextended){
          // if(this.infos.relation.join("") != ''){
            this.relDialog = !this.relDialog;
            this.draft.relationChanged(this.snapInfos.s, 
              this.snapInfos.depid, 
              this.snapInfos.govid, 
              this.infos.relation.join(""), 
              addasextended);
            this.up(true, false);
          // }
        },
        onchangecat(){
          this.catDialog = !this.catDialog;
          this.draft.catChanged(this.snapInfos.s, this.snapInfos.depid, this.infos.category);
          this.up(true, false);
        },
        onchangefeature(){
          this.featureDialog = !this.featureDialog;
          this.draft.featureChanged(this.snapInfos.s, this.snapInfos.depid, this.infos.category);
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

<style>
.vs-dark .vs__search::placeholder,
  .vs-dark .vs__dropdown-toggle,
  .vs-dark .vs__dropdown-option,
  .vs-dark .vs__dropdown-menu,
  .vs-dark .vs__selected {
    background: #343436;
    border: none;
    color: white;
  }
.vs-dark .vs__clear,
.vs-dark .vs__open-indicator {
  fill: #635e72;
}
.vs-dark .vs__dropdown-option--highlight { background: #501d7d; color:white; }

.vs-light .vs__search::placeholder,
  .vs-light .vs__dropdown-toggle,
  .vs-light .vs__dropdown-option,
  .vs-light .vs__dropdown-menu,
  .vs-light .vs__selected {
    background: #d0d0dd;
    border: none;
    color: rgb(14, 13, 13);
  }
.vs-light .vs__clear,
.vs-light .vs__open-indicator {
  fill: #73707c;
}
.vs-light .vs__dropdown-option--highlight { background: #501d7d; color:white; }
</style>