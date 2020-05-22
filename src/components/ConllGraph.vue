<template>
    <div class="sentencebox">
      <svg :id="id" :ref="id" :class="$q.dark.isActive?'dark':''"></svg>

      <q-dialog        
        v-model="relDialog"
        :maximized="maximizedToggle"
        @hide="ondialoghide()"
        
      >
      <!-- @keyup.enter="onchangerel(false)" -->
        <q-card >
          <q-bar class="bg-primary text-white">
            <div class="text-weight-bold">
              Select a relation going from "{{snap.currentword}}" to "{{snap.currentdepword}}"
            </div>
            <q-space />
            <q-btn flat dense icon="close" v-close-popup/>
          </q-bar>
          <attribute-table 
            :featdata="options.relav" 
            :columns="featTable.columns"
            :featOptions="options.currentoptions"  
            openFeatures=false
            modifiable=false
            title="Dependency relation"
            @feature-changed="informFeatureChanged()"
            prepend=true
          />
          <q-space />
          <q-card-actions >
            <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup  style="width: 35%; margin-left: auto; margin-right: auto;" />
            <q-space />
            <q-btn color="primary" @click="onchangerel(options.extendedrel)" label="Ok" v-close-popup style="width: 35%; margin-left: auto;margin-right: auto;" />
            <!-- :disabled="!someFeatureChanged" -->
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
              <div class="text-weight-bold">
                Select a category for "{{snap.currentword}}"
              </div>
              <q-space/>
              <q-btn flat dense icon="close" v-close-popup/>
          </q-bar>
          <q-card-section style="height:200px">
            <q-select id="catselect"
                filled
                v-model="snap.category"
                :options="options.annof.UPOS"
                label="Category"
                style="width: 250px"
              />
            </q-card-section>
          <q-separator/>
          <q-card-actions>
            <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            <q-btn id="catselectvalidate" color="primary" @click="onchangecat()" label="Ok" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" :disabled="snap.currentcategory == snap.category" />
          </q-card-actions>
        </q-card>
      </q-dialog>



      <q-dialog        
        v-model="featureDialog"
        :maximized="maximizedToggle"
        >
        <!-- @hide="ondialoghide()" @keyup.enter="onFeatureDialogOk()" @keyup.enter="ononefeaturemodified()"-->
        <q-card  style="height:90vh">
          <q-bar class="bg-primary text-white">
              <div class="text-weight-bold">
                Features of "{{snap.currentword}}"
              </div>
              <q-space />
              <q-btn flat dense icon="close" v-close-popup/>
          </q-bar>
        <attribute-table 
          :featdata="featTable.featl" 
          :columns="featTable.columns"
          :featOptions="options.annof.FEATS" 
          openFeatures=false
          modifiable=true
          title="Universal Features"
          @feature-changed="informFeatureChanged()"
          />
        <q-separator/>
        <attribute-table 
          :featdata="featTable.miscl" 
          :columns="featTable.columns"
          :featOptions="options.annof.MISC" 
          openFeatures=true
          modifiable=true
          title="Miscellaneous Features"
          @feature-changed="informFeatureChanged()"
          /><q-separator/>
        <attribute-table 
          :featdata="featTable.lemma" 
          :columns="featTable.columns"
          :featOptions="options.lemmaoptions" 
          openFeatures=false
          modifiable=false
          title="Lemma"
          @feature-changed="informFeatureChanged()"
          />
          <q-separator/>
          <q-card-actions align="around">
            <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            <q-btn color="primary" @click="onFeatureDialogOk()" label="Ok" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" :disabled="!someFeatureChanged" /> 
          </q-card-actions>
        </q-card>
      </q-dialog>


      <q-dialog        
        v-model="metaDialog"
        :maximized="maximizedToggle"
        >
        <q-card  style="height:110vh; width:110vh">
          <q-bar class="bg-primary text-white">
              <div class="text-weight-bold">
                Metadata of this sentence
              </div>
              <q-space />
              <q-btn flat dense icon="close" v-close-popup/>
          </q-bar>
        <attribute-table 
          :featdata="snap.metal" 
          :columns="featTable.columns"
          :featOptions="['String']" 
          openFeatures=true
          modifiable=true
          title="Meta Sentence Features"
          @feature-changed="informFeatureChanged()"
          />
        <q-separator/>
            <!-- todo: adapt informFeatureChanged also to metadata -->
          <q-card-actions align="around">
            <q-btn flat  label="Cancel" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            <q-btn color="primary" @click="onMetaDialogOk()" label="Ok" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" :disabled="!someFeatureChanged" /> 
          </q-card-actions>
        </q-card>
      </q-dialog>


      <q-dialog        
        v-model="tokenDialog"
        :maximized="maximizedToggle"
        >
        <q-card  style="height:90vh; width:90vh">
          <q-bar class="bg-primary text-white">
              <div class="text-weight-bold">
                Replacing "{{snap.currentword}}" by:
              </div>
              <q-space />
              <q-btn flat dense icon="close" v-close-popup/>
          </q-bar>
        <attribute-table 
          :featdata="snap.tokl" 
          :columns="featTable.columns"
          :featOptions="['String']" 
          openFeatures=true
          modifiable=true
          title="Token"
          :numbered="snap.currentword"
          />
        <q-separator/>
          <q-card-actions align="around">
            <q-btn flat  label="Cancel" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            <q-btn color="primary" @click="onTokenDialogOk()" label="I know what I'm doing" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" no-caps>
              <q-tooltip content-class="bg-negative" content-style="font-size: 16px" transition-show="rotate" transition-hide="rotate">⚠ Changing tokens breaks the comparability of different annotations of the same sentence!</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>


      <q-dialog v-model="conllDialog" full-width>
        <q-layout view="Lhh lpR fff" container class="bg-white">
          <q-header class="bg-primary">
            <q-toolbar>
              <q-toolbar-title>CoNLL of {{sentenceId}}</q-toolbar-title>
              <q-btn flat v-close-popup round dense icon="close" />
            </q-toolbar>
          </q-header>
          <q-page-container >
            <q-page >
              <codemirror 
                v-model="conllContent" 
                :options="cmOption" 
                class="CodeMirror" 
                @focus="codefocus"
                />
                <!-- </codemirror> -->
               <!-- @input="codechange($event)"  ($event)-->
            </q-page>
          </q-page-container>
           <q-footer >
            <q-toolbar inset>
              <!-- <q-toolbar-title>Footer</q-toolbar-title> --><q-space/>
              <q-btn flat no-caps label="Cancel" v-close-popup  />
              <q-btn color="primary" @click="onConllDialogOk()" label="Ok" v-close-popup :disabled="currentConllContent == conllContent"/> 
            </q-toolbar>
          </q-footer>
        </q-layout>
      </q-dialog>

    
    </div>

    <!-- <div :id="id" v-html="svgContent"></div> -->
</template>

<script>


import Vue from 'vue'
// import 'vue-select/dist/vue-select.css';

import AttributeTable from './AttributeTable'
Vue.config.ignoredElements = ['conll'];
import { codemirror } from 'vue-codemirror'
import CodeMirror from 'codemirror'

CodeMirror.defineMode('tsv', function(_config, parserConfig) {
       
	function tokenBase(stream, state) {
	    var ch = stream.next();
	    if (ch === '#' ) {
		stream.skipToEnd();
		return 'comment';
	    }

	    if (/\d/.test(ch)) {
		stream.eatWhile(/[\d]/);
		if (stream.eat('.')) {
		    stream.eatWhile(/[\d]/);
		}
		return 'number';
	    }
	    if ( /[+\-*&%=<>!?|:]/.test(ch)) {
		return 'operator';
	    }
	    stream.eatWhile(/\w/);
	    var cur = stream.current();
	    return 'variable';
	}

	// function tokenString(stream, state) {	}

	return {
	    startState: function() {return {tokenize: tokenBase, commentLevel: 0};},
	    token: function(stream, state) {
        if (stream.eatSpace()) return null;
        return state.tokenize(stream, state);
          },
	    lineComment: "#"
	};
    
  }); // end codemirror

export default {
    name:'conllGraph',
    components: {
        AttributeTable, codemirror
    },
    props: ['conll', 'user', 'sentenceId', 'matches'],
    data(){
        return {
            draft: new ArboratorDraft(),
            id: this.user+'_'+this.sentenceId.replace(/\W/g, ''),
            svgContent: '',
            conllContent: '',
            currentConllContent: '',
            conllDialog: false,
            loading: true,
            snap: { // graph specific stuff
                treedata:{},
                currentword: null,
                currentdepword: null,
                category: null,
                currentcategory: null,
                snapcat:null,
                feat: 'Abbr',
                feats: {},
                misc: {},
                metal: [],
                tokl:[],
                tokidsequence: [],
                depid:0,
                govid:0,
                relation: 'some relation',
                snaprelation: null,
                snaptoken:null,
            },
            options: { // attribute table dialog specific stuff
                annof:[], // = annotationFeatures from conf!!!
                annofFEATS:{}, // obj version (instead of list)
                annofMISC:{}, // obj version (instead of list)
                splitregex:"",
                relav:[],
                currentoptions: [],
                extendedrel: false,
                lemmaoptions:[{'name':'Lemma','values':'String'}]
            },
            featTable: {
              featl: [],
              miscl: [],
              lemma: [],
              columns: [
                { name: 'a', align: 'center', label: 'Attribute', field: 'a', sortable: true, style: "width: 33%" },
                { name: 'v', label: 'Value', field: 'v', sortable: true, },
                { name: 'actions', label: 'Actions', field: '', align:'center', style: 'width: 8%' }
              ]
            },
            someFeatureChanged: false,
            model: null,
            relDialog: false,
            catDialog: false,
            featureDialog: false,
            metaDialog: false,
            tokenDialog: false,
            maximizedToggle: false,
            
            cmOption: {
                tabSize: 8,
                styleActiveLine: true,
                // lineNumbers: true,
                lineWrapping: true,
                line: true,
                mode: 'tsv',
                
                theme: 'default'
            },
        }
    },
    computed: {
    },
    mounted(){
        this.getProjectConfig();
        this.start(this.conll, this.matches, this.id, this.user);
        // precompute to check for changes quickly:
        this.options.annofFEATS = this.options.annof.FEATS.reduce(function(obj, r) {if (r.values) obj[r.name] = r.values; return obj;}, {});
        this.options.annofMISC = this.options.annof.MISC.reduce(function(obj, r) {if (r.values) obj[r.name] = r.values; return obj;}, {});
        this.options.splitregex = new RegExp('['+this.options.annof.DEPREL.map(({ join }) => join).join('')+']', 'g') // = /[:@]/g  
    },
    methods: {
        /**
         * replace the default labels and cats by the ones in the config if list not empty
         */
        getProjectConfig(){
          var conf = this.$store.getters.getProjectConfig;
          this.options.annof = conf.annotationFeatures;
          this.options.shownfeatures = conf.shownfeatures;
          this.options.shownmeta = conf.shownmeta;
          
        },
        up(dirty, redo) {
          // console.log(svg.tree)
          // console.log("NOW"); // when I open a sentence, when I click on OK after editing a category or a relation;
          // console.log("gonna emit ", this.draft, this.id);
          // console.log('conll', this.draft.getConll(this.snapInfos.paper));
          // { treedata: {}, dirty: false, redo: false, user: '' }            'conll': this.draft.getConll(this.snapInfos.paper), 
            // if(this.snapInfos.paper != null){
            if(this.snap.treedata != null){
              this.$emit('update-conll', {
                'conllGraph': this, 
                'dirty': dirty, 
                'redo': redo, 
                'user': this.user}); //emits to parent the id of the tree and a bunch of other stuff
            }
          },
        start(conllStr, matches, id){
            if (this.user in matches) var usermatch = matches[this.user];
            else var usermatch = {'nodes':[],'edges':[]};
            this.snap.treedata = this.draft.drawit(conllStr, usermatch, id, this.options.shownfeatures); // here it happens
            this.loading = false;
            // give the draft access to these functions:
            this.snap.treedata.openRelationDialog = this.openRelationDialog;
            this.snap.treedata.openCategoryDialog = this.openCategoryDialog;
            this.snap.treedata.openFeatureDialog = this.openFeatureDialog;
            this.up(false, false);
            this.snap.metal=[];
            for (let a in this.snap.treedata.META) { this.snap.metal.push({ 'a':a, 'v':this.snap.treedata.META[a]})}
            this.$emit("meta-changed", this.snap.treedata.META); // so that the sentenceCard can show the meta feature such as text and text_en
        },

        codefocus(cm,ev) {
          // console.log('ev', cm,ev);
          cm.refresh();
          cm.execCommand('selectAll');
        },
       
        openRelationDialog(s, snaprelation, govid, depid, govwordform, depwordform, relation, ctrlkey){
          // called from snap
          // snaprelation.attr({class:"deprelselected"});
          // relation="qsdwf:zsert@swxcv";
          this.snap.treedata.s = s;
          var subrels = relation.split(this.options.splitregex)
          this.options.extendedrel = ctrlkey;
          var depr = (ctrlkey) ? this.options.annof.DEPS : this.options.annof.DEPREL; //options.annof.DEPREL
          this.options.currentoptions=depr;
          
          this.options.relav = depr.map( sr => ({'a':sr.name,'v':'', 'join':sr.join}))

          for (var i = 0; i < subrels.length; ++i) {
                     for (var ii = i; ii < depr.length; ++ii) {
                        if (relation.includes(depr[ii].join + subrels[i]) )
                        {
                          this.options.relav[ii]={'a':depr[ii].name, 'v':subrels[i], 'join':depr[ii].join };
                          break
                        }
                     }
                }
          // console.log(45646,this.options.relav)
          this.snap.depid = depid;
          this.snap.govid = govid;
          this.snap.relation = relation;
          this.snap.snaprelation = snaprelation;
          
          this.snap.currentword=govwordform;
          this.snap.currentdepword=depwordform;
          this.relDialog = !this.relDialog;
        },
        onchangerel(addasextended){
            this.relDialog = !this.relDialog;
            this.snap.treedata = this.draft.relationChanged(
              this.snap.treedata,
              this.snap.depid, 
              this.snap.govid, 
              this.options.relav.reduce(((tot,cur,i)=>tot+=(this.options.relav[i].v) ? this.options.annof.DEPREL[i].join+cur.v :''),''), 
              addasextended);
            this.up(true, false);
        },
      
        openCategoryDialog(paper, snapcat, wordform, depid, category){
          // called from snap
          this.snap.currentcategory = category;
          this.snap.category = category;
          this.snap.currentword = wordform;
          this.snap.snapcat = snapcat;
          this.snap.depid = depid;
          this.catDialog = !this.catDialog;
        },
        onchangecat(){
          this.catDialog = !this.catDialog;
          this.snap.treedata = this.draft.catChanged(this.snap.treedata, this.snap.depid, this.snap.category);
          this.snap.snapcat = null;
          this.up(true, false);
        },
    
        openMetaDialog(){   
          // called from sentenceCard       
          this.metaDialog = !this.metaDialog;
        },
        onMetaDialogOk(){
          this.snap.treedata = this.draft.metaChanged(
                              this.snap.treedata, 
                              this.snap.metal.reduce(function(obj, r) {if (r.v) obj[r.a] = r.v; return obj;}, {})
                              );
          // this.snapInfos = {paper:this.snap.treedata.svg}
          this.up(true, false);
          var fun = this.featureUpdateNeeded();
          if (fun) {console.log('the conf.annotationFeatures should be updated via a flask function')} // TODO!
          // console.log('fun',fun,this.featTable.featl, this.featTable.miscl)
          this.$emit("meta-changed", this.snap.treedata.META);
        },

        openFeatureDialog(paper, snaptoken, wordform, lemma, depid, snapfeats, snapmisc){
          // called from snap
          this.someFeatureChanged=false;
          this.snap.currentword=wordform;
          this.featTable.featl = [];
          for (let a in snapfeats) { this.featTable.featl.push({ 'a':a, 'v':snapfeats[a]})}
          this.featTable.miscl = [];
          for (let a in snapmisc) { this.featTable.miscl.push({'a':a, 'v':snapmisc[a]})}
          this.featTable.lemma = [{'a':'Lemma', 'v':lemma}];
          this.snap.snaptoken = snaptoken;
          this.snap.depid = depid;
          this.snap.snaptoken = snaptoken;
          this.featureDialog = !this.featureDialog;
        },
        onFeatureDialogOk(){
          if (this.someFeatureChanged) {
             this.snap.treedata = this.draft.featureChanged(
                              this.snap.treedata,
                              this.snap.depid, 
                              this.featTable.lemma.reduce(function(obj, r) {if (r.v) obj[r.a] = r.v; return obj;}, {})["Lemma"], 
                              this.featTable.featl.reduce(function(obj, r) {if (r.v) obj[r.a] = r.v; return obj;}, {}), 
                              this.featTable.miscl.reduce(function(obj, r) {if (r.v) obj[r.a] = r.v; return obj;}, {}),
                              );
          }
          this.up(true, false);
          var fun = this.featureUpdateNeeded();
          if (fun) {console.log('the conf.annotationFeatures should be updated via a flask function')} // TODO!
        },
        featureUpdateNeeded(){
          for(let r of this.featTable.featl){ 
              if (!((this.options.annofFEATS[r.a] || []).includes(r.v))) return true
            }
          for(let r of this.featTable.miscl){  
              var cs = this.options.annofMISC[r.a] || [];
              if (!(cs).includes(r.v)) 
              { 
                if(cs=='String') {continue}
                else if(cs=='Number' && parseFloat(r.v) == r.v) {continue}
                return true
                }
              
            }
          return false

        },
        informFeatureChanged(){
          this.someFeatureChanged=true;
        },
        
        ondialoghide(){ 
          if (this.snap.snaprelation) {this.snap.snaprelation.attr({class:"DEPREL"});this.snap.snaprelation=null;}
          if (this.snap.snapcat) {this.snap.snapcat.attr({class:"UPOS"});this.snap.snapcat=null;}
        },

        openTokenDialog(b,e,t){
          // begin index, end index, selected token of text field in sentenceCard
          while(t[t.length-1]==" "){t=t.substring(0,t.length-1 );--e}
          while(t[0]==" "){t=t.substring(1 );b++}
          var toks = Object.values(this.snap.treedata.tree).map(({ FORM }) => FORM)
          var spa = Object.values(this.snap.treedata.tree).map(({ MISC }) => ('SpaceAfter' in MISC && MISC.SpaceAfter=='No')?0:1)
          var toktok = []
          var currp = 0;
          var sentence = ""
          for (var i = 0; i < toks.length; ++i) {
            sentence+=toks[i]+((spa[i])?' ':'');
            toktok.push( {'i':i+1, 't':toks[i], 'b':currp, 'e':currp+toks[i].length})
            currp+=toks[i].length+spa[i]
          }          
          var ints = toktok.filter(x => x.b>=b && x.e<=e)
          var outts = toktok.filter(x => x.b>=b && x.b<=e || x.e>=b && x.e<=e)
          if (!outts.length) return; // strange, shouldn't happen
          var proposedav=[]
          if (outts[0].b<b) proposedav.push(
            { 'a':1, 'v':outts[0].t.substring(0,b-outts[0].b) },
            { 'a':2, 'v':outts[0].t.substring(b-outts[0].b) }
          )
          for (let to of ints) proposedav.push({ 'a':proposedav.length+1, 'v':to.t })
          if (e<outts[outts.length-1].e) proposedav.push(
              { 'a':proposedav.length+1, 'v':outts[outts.length-1].t.substring(0,e-outts[outts.length-1].b) },
              { 'a':proposedav.length+2, 'v':outts[outts.length-1].t.substring(e-outts[outts.length-1].b) }
            )
          this.snap.tokidsequence = outts.map(({ i }) => i);
          if (outts){
            this.snap.currentword=sentence.substring(outts[0].b,outts[outts.length-1].e);
            this.snap.tokl=proposedav ;
            this.tokenDialog = !this.tokenDialog;
          }
        },
        onTokenDialogOk(){
          this.tokenDialog = !this.tokenDialog;
          var ttokl = this.snap.tokl.map(({ v }) => v).filter(x => x.trim().length>0)
          var treedata = this.draft.replaceNodes(
              this.snap.treedata, 
              this.snap.tokidsequence, 
              (ttokl.length) ? this.snap.tokidsequence[0] : this.snap.tokidsequence[0]-1, 
              ttokl
            );          
          this.$emit("meta-changed", this.snap.treedata.META); 
          this.up(true, false);
        },
        openConllDialog(){
          this.conllDialog = !this.conllDialog;
          this.conllContent = this.draft.getConll(this.snap.treedata);
          this.currentConllContent = this.conllContent;
          
        },
        onConllDialogOk() {
            // console.log('555',this.conllContent);
            try {
                this.snap.treedata.s.paper.clear()
                this.start(this.conllContent, {'nodes':[],'edges':[]}, this.id);
                this.up(true, false);
            } catch (error) {
              console.error(error);
              error.caption = "Take a little time to learn the CoNLL-U conventions"
              this.$store.dispatch("notifyError", {error: error});
              this.snap.treedata.s.paper.clear()
              this.start( this.currentConllContent, {'nodes':[],'edges':[]}, this.id);
              this.up(false, false);
            }
           
        }
    }
}


</script>

<style>
  .CodeMirror {
  border: 1px solid rgb(238, 238, 238);
  height: auto;
  height: 100%
}
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