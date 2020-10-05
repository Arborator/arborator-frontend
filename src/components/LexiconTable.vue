<template>
  <div>
    <q-table
      ref="table"
      title="Lexicon"
      :class="($q.dark.isActive?'my-sticky-header-table-dark':'my-sticky-header-table' ) +  ' rounded-borders'"
      :data="this.data"
      :columns="table.columns"
      row-key="key"
      :pagination.sync="table.pagination"
      :loading="table.loading"
      loading-label="loading"
      :filter="table.filter"
      binary-state-sort
      :rows-per-page-options="[0]"
      :visible-columns="table.visibleColumns"
      selection="multiple"
      :selected.sync="table.selected"
      :table-header-class="$q.dark.isActive?'text-white':'text-primary'"
      virtual-scroll
      card-class="shadow-8"
      :key="tableKey"
      table-style="max-height:80vh"
      @row-click="onRowClick">
      >
    <template v-slot:body-cell="props">
      
      <td v-if="props.row.changed=='replace'" style="background: mediumseagreen">{{props.value}}</td>
      <td v-else-if="props.row.changed=='add'" style="background: orange">{{props.value}}</td>
      <td v-else-if="props.row.changed=='delete'" style="background: #f34336">{{props.value}}</td>
      <td v-else>{{props.value}}</td>

    </template>

    <template v-slot:top-right>
          <q-btn-group flat>
            <q-btn color="default" v-show="table.selected.length<1" flat icon="delete_forever" disable><q-tooltip>Delete seleted samples</q-tooltip></q-btn>
            <q-btn color="default" v-show="table.selected.length!=0" flat icon-right="delete_forever" @click="deleteSelected"><q-tooltip>Delete seleted samples</q-tooltip></q-btn>
            <q-btn color="default" flat label="tsv" @click="exportLexiconTSV()" :loading="tableExporting"><q-tooltip :delay="300" content-class="text-white bg-primary">{{$t('projectView').tooltipExportLexicon[0]}}</q-tooltip></q-btn>
            <q-btn color="default" flat label="json" @click="exportLexiconJSON()" :loading="tableExporting"><q-tooltip :delay="300" content-class="text-white bg-primary">{{$t('projectView').tooltipExportLexicon[1]}}</q-tooltip></q-btn>
            <q-btn color= "default" flat label="Rule Grew" @click="getRulesGrew()" :disable="RulesGrew.length<0"><q-tooltip :delay="300" content-class="text-white bg-primary">{{$t('projectView').tooltipRuleGrewLexicon}}</q-tooltip></q-btn>
            <q-btn flat color="default" v-show="CompareDics==false" icon="cloud_upload" @click="uploadDial = true" ><q-tooltip :delay="300" content-class="text-white bg-primary">{{$t('projectView').tooltipValidatorLexicon}}</q-tooltip></q-btn>
            <q-btn flat color="default" v-show="CompareDics==true" icon="cloud_upload" @click="CompareDics = false" ><q-tooltip :delay="300" content-class="text-white bg-primary">{{$t('projectView').tooltipValidatorLexicon}}</q-tooltip></q-btn>
          </q-btn-group>
    </template>
    </q-table>
    <div v-show="CompareDics===true">
      <q-space />
      <q-card>
        <q-separator/>
        <compare-lexicon
          :data="this.dics">
        </compare-lexicon>
      </q-card>
    </div>
    <q-dialog v-model="openFeatures">
      <q-card>
          <q-bar class="bg-primary text-white">
              <div class="text-weight-bold">
                  Features of "{{currentword}}"
              </div>
              <q-space />
              <q-btn flat dense icon="close" v-close-popup/>
          </q-bar>
          <attribute-table 
              :featdata="featTable.form" 
              :columns="featTable.columns"
              openFeatures=false
              modifiable=false
              title="Form"
              :featOptions="['String']" 
              @feature-changed="informFeatureChanged()"
          />
          <q-separator/>
          <attribute-table 
              :featdata="featTable.lemma" 
              :columns="featTable.columns"
              openFeatures=false
              modifiable=false
              title="Lemma"
              :featOptions="options.lemmaoptions" 
              @feature-changed="informFeatureChanged()"
          />
          <attribute-table 
              :featdata="featTable.pos" 
              :columns="featTable.columns"
              openFeatures=false
              modifiable=false
              title="Category"
              :featOptions="options.catoptions" 
              @feature-changed="informFeatureChanged()"
          />
          <attribute-table
              :featdata="featTable.featl" 
              :columns="featTable.columns"
              openFeatures=false
              modifiable=true
              title="Universal Features"
              :featOptions="options.annof.FEATS" 
              @feature-changed="informFeatureChanged()"
          />
          <attribute-table 
              :featdata="featTable.gloss" 
              :columns="featTable.columns"
              openFeatures=false
              modifiable=false
              title="Gloss"
              :featOptions="['String']" 
              @feature-changed="informFeatureChanged()"
          />
          <q-separator/>
          <q-card-actions align="around">
            <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup  style="width: 35%; margin-left: auto; margin-right: auto;" />
            <q-btn flat @click="addEntry()" label="Add entry" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" />
            <q-btn v-if="featTable.changed!='add'" color="primary" @click="replaceEntry()" :loading="exporting" label="Replace entry" v-close-popup style="width: 45%; margin-left: auto;margin-right: auto;" /> 
          </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="searchDialog" seamless position="right" full-width>
      <grew-request-card
        :parentOnSearch="onSearch"
        :parentOnTryRule="onTryRule"
        :grewquery="$route.query.q || ''"
      ></grew-request-card>
    </q-dialog>
    <q-dialog
      v-model="resultSearchDialog"
      transition-show="fade"
      transition-hide="fade"
    >
      <result-view
        :searchresults="resultSearch"
        searchscope="project"
      ></result-view>
      <!-- :totalsents="project.infos.number_sentences" -->
    </q-dialog>

    <q-dialog v-model="uploadDial" :maximized="maximizedUploadToggle" transition-show="fade" transition-hide="fade" >
      <q-card style=" max-width: 100vw;">
          <q-bar>
              <q-space />
              <q-btn dense flat icon="minimize" @click="maximizedUploadToggle = false" :disable="!maximizedUploadToggle">
                  <q-tooltip v-if="maximizedUploadToggle" content-class="bg-white text-primary">{{$t('projectView').tooltipWindows[0]}}</q-tooltip>
              </q-btn>
              <q-btn dense flat icon="crop_square" @click="maximizedUploadToggle = true" :disable="maximizedUploadToggle">
                  <q-tooltip v-if="!maximizedUploadToggle" content-class="bg-white text-primary">{{$t('projectView').tooltipWindows[1]}}</q-tooltip>
              </q-btn>
              <q-btn dense flat icon="close" v-close-popup>
                  <q-tooltip content-class="bg-white text-primary">{{$t('projectView').tooltipWindows[2]}}</q-tooltip>
              </q-btn>
          </q-bar>

          <q-card-section>
              <div class="text-h6 text-blue-grey-8">{{$t('projectView').tooltipSelectValidator}}</div>
          </q-card-section>
          
          <q-card-section > 
              <q-file v-model="uploadSample.attachment.file" label="Pick files" outlined  use-chips clearable :loading="uploadSample.submitting" multiple style="max-width: 400px">
                  <template v-slot:after >
                      <q-btn color="primary" dense icon="cloud_upload" round @click="upload()" :loading="uploadSample.submitting" :disable="uploadSample.attachment.file == null"/>
                  </template>
              </q-file>
          </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>

import api from '../boot/backend-api';
import { openURL } from 'quasar'
import AttributeTable from './sentence/AttributeTable';
import GrewRequestCard from './GrewRequestCard';
import CompareLexicon from './CompareLexicon';
import grewTemplates from '../assets/grew-templates.json';
import ResultView from "../components/ResultView";

export default {
  name: "LexiconTable",
  props: ["data"],
  components: {
    GrewRequestCard,
    CompareLexicon,
    AttributeTable,
    ResultView
  },

  data() {
    return {
      queries: grewTemplates,
      selected:[],
      openFeatures:false,
      tableExporting:false,
      currentword: null,
      someFeatureChanged: false,
      exporting:false,
      RulesGrew:[],
      currentinfo: null,
      tempfeat: '',
      infotochange: null,
      temp_features: '_',
      indexfeat:0,
      resultSearchDialog:false,
      searchDialog:false,
      RulesApplied : false,
      uploadDial : false,
      maximizedUploadToggle:false,
      download : [],
      uploadLexicon : [],
      CompareDics : false,
      dics : [],
      rules_grew : [],
      resultSearch: {},
      featTable: {
        form:[],
        pos:[],
        featl: [],
        miscl: [],
        lemma: [],
        gloss:[],
        changed:null,
        columns: [
          { name: 'a', align: 'center', label: 'Attribute', field: 'a', sortable: true, style: "width: 33%" },
          { name: 'v', label: 'Value', field: 'v', sortable: true, },
          { name: 'actions', label: 'Actions', field: '', align:'center', style: 'width: 8%' }
        ]
      },
      options: { // attribute table dialog specific stuff
        annof:[], // = annotationFeatures from conf!!!
        annofFEATS:{}, // obj version (instead of list)
        annofMISC:{}, // obj version (instead of list)
        splitregex:"",
        relav:[],
        currentoptions: [],
        extendedrel: false,
        lemmaoptions:[{'name':'Lemma','values':'String'}],
        catoptions:[]
        },
      table:{
        columns:[
            { name: 'form', label:'Form', sortable: true, align: 'left', field: 'form'},
            { name: 'lemma', label: 'Lemma', sortable: true, align: 'left', field: 'lemma' },
            { name: 'pos', label: 'POS', sortable: true, align: 'left', field: 'POS' },
            { name: 'features', label: 'Features', sortable: true, align: 'left', field: 'features' },
            { name: 'gloss', label: 'Gloss', sortable: true, align: 'left', field: 'gloss' },
            { name: 'frequency', label: 'Frequency', sortable: true, align: 'left', field: 'frequency' },
            { name: 'key', label: 'Key', sortable: true, align: 'left', field: 'key' }
        ],                
        visibleColumns: ['form', 'lemma', 'pos', 'features', 'gloss', 'frequency'],
        filter: '',
        selected: [],
        loading: false,
        pagination: {
            sortBy: 'name',
            descending: false,
            page: 1,
            rowsPerPage: 10
        },
        loadingDelete: false,
        exporting: false        
      },
      alerts: { 
                'noRuletoApply': { color: 'negative', message: 'No rule to apply'},
                'noModification': { color: 'negative', message: 'No modification'},
                'getRulegrewSuccess': { color: 'positive', message: 'got rule grew.' },
                'onlyOneFile': { color : 'negative', message:'One file is expected'},
                'onlyTSVFile' : {color : 'negative', message:'TSV file is expected'},
            },
      uploadSample: {
          submitting: false,
          attachment: { name: null, file: null}
      },
      tableKey: 0,
    };
  },

  mounted() {
    this.options.annof = this.$store.getters['config/annotationFeatures'];
    this.options.catoptions.push({'name':'POS', 'values':this.options.annof.UPOS});
    if (this.$route.query.q && this.$route.query.q.length > 0)
      this.searchDialog = true;
  },
  methods: {
    addValidator(Validator){
      for (let i = 0; i < this.data.length; i++){
        if (this.data[i]['changed']!= 'delete' && this.data[i]['changed']!= 'replace'){
          if(!('frequency' in this.data[i])) {this.data[i].frequency = '_'}
          this.uploadLexicon.push(this.data[i])
        }
      }
      var datasample = { data: this.uploadLexicon, validator : Validator};
      // console.log(datasample)
      api.addValidator(this.$route.params.projectname, datasample)
      .then( response => { 
        this.CompareDics = true
        this.dics = response.data.dics ;
        console.log(this.dics) ;
      }).catch(error => {
          // this.$q.notify({message:`${error}`, color:'negative'});
          this.$store.dispatch("notifyError", {error: error});
          return [];
      });
      this.uploadLexicon = [];
    },
    upload(){
      var form = new FormData();
      this.uploadSample.submitting = true;
      if (this.uploadSample.attachment.file.length == 1){
        for(const file of this.uploadSample.attachment.file){ form.append('files',file); 
        api.uploadValidator(this.$route.params.projectname, form).then( response => { 
          this.uploadSample.attachment.file = []; 
          this.uploadDial = false; 
          this.addValidator(response.data.validator);
          this.uploadSample.submitting = false;})
          .catch(error => { 
            if (error.response) 
            {
                error.response.message = error.response.data.message;
                error.permanent = true;
            }
            error.caption = "Check your file please!"
            this.uploadSample.submitting = false; 
            this.uploadDial = false; 
            this.$store.dispatch("notifyError", {error: error}); });
        }
      }
      else {this.showNotif('top', 'onlyOneFile');}
    },
    getRulesGrew(){
      if(this.RulesGrew.length!=0){
        var datasample = { data: this.RulesGrew};
        // console.log(123123,datasample)
        api.transformation_grew(this.$route.params.projectname, datasample)
        .then(response => {
          console.log(444555666,response.data)
          var pattern_prov = response.data.patterns+response.data.without;
          this.rules_grew = response.data.tryRules;
          console.log(888888, this.rules_grew)
          if ( this.RulesApplied == false ){
            if (response.data.without != ""){
              if ( this.queries.length == 6 || this.queries[6]['name'] != 'Correct lexicon'){
              this.queries.push({"name":"Correct lexicon", "pattern":pattern_prov, "commands":response.data.commands, 'without':response.data.without})}
              else ( this.queries[6] = {"name":"Correct lexicon", "pattern":pattern_prov, "commands":response.data.commands, 'without':response.data.without})
            // Cette requête est à supprimer après onTryRule !!!!!!!!!!!!!!!!!!!!!
              }
            else {
              if ( this.queries.length == 6 || this.queries[6]['name'] != 'Correct lexicon'){
              this.queries.push({"name":"Correct lexicon", "pattern":pattern_prov, "commands":response.data.commands})}
              else ( this.queries[6] = {"name":"Correct lexicon", "pattern":pattern_prov, "commands":response.data.commands})
              }
            }
          else {
            if (response.data.without != ""){
              this.queries[6] = {"name":"Correct lexicon", "pattern":pattern_prov, "commands":response.data.commands, "without":response.data.without}
              this.RulesApplied = false;
              }
            else {
              this.queries[6] = {"name":"Correct lexicon", "pattern":pattern_prov, "commands":response.data.commands, "without":response.data.without}
              this.RulesApplied = false;
            }
          }
        
        })
        this.searchDialog=true;
        // console.log(789789789,this.queries)
        }
      else{this.showNotif('top', 'noRuletoApply');}
    },
    ondialoghide(){},
    onSearch(searchPattern){
      var query = { pattern: searchPattern };
      api.searchProject(this.$route.params.projectname, query)
      .then(response => {
          this.resultSearchDialog = true;
          this.resultSearch = response.data;
      }).catch(error => {  this.$store.dispatch("notifyError", {error: error})  });
    },
    onTryRule(searchPattern, rewriteCommands) {
      console.log(12121, searchPattern, rewriteCommands);
      var query = { pattern: searchPattern, rewriteCommands: rewriteCommands };
      api
        .tryRuleProject(this.$route.params.projectname, query)
        .then((response) => {
          this.resultSearchDialog = true;
          this.resultSearch = response.data;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", {
            error: error.response.data.message,
          });
        });
    },
    addEntry(){
      if(this.infotochange !=""){
      this.data[this.indexfeat].changed='delete'
      var newRow = {
        form:this.featTable.form[0]['v'],
        lemma:this.featTable.lemma[0]['v'],
        POS:this.featTable.pos[0]['v'],
        features: this.temp_features,
        gloss: this.featTable.gloss[0]['v'],
        changed:'add',
        key:this.featTable.form[0]['v']+this.featTable.lemma[0]['v']+this.featTable.pos[0]['v']+this.temp_features+this.featTable.gloss[0]['v']
      };
      console.log(321321321, newRow)
      this.data.splice(this.indexfeat+1,0, newRow)}
      else{this.showNotif('top', 'noModification');}
      // console.log(this.data)
      // console.log(my_object)
      // this.form = '';
      // this.lemma = '';
      // this.pos = '';
      // this.features = '';
      // this.gloss = '';
      // this.changed=null;
    },
    informFeatureChanged(){
      this.someFeatureChanged=true;
      //console.log(this.featTable.lemma)
      // console.log(this.featTable.featl.length)
      // console.log(this.featTable.form[0])
      if (this.featTable.featl.length ==0){this.infotochange = this.featTable.form[0]["v"]+' '+this.featTable.lemma[0]["v"]+' '+this.featTable.pos[0]["v"]+' '+this.featTable.gloss[0]["v"]+' _'}
      else { 
        if(this.featTable.featl.length ==1){this.infotochange = this.featTable.form[0]["v"]+' '+this.featTable.lemma[0]["v"]+' '+this.featTable.pos[0]["v"]+' '+this.featTable.gloss[0]["v"]+' '+this.featTable.featl[0]['a']+'='+this.featTable.featl[0]['v']
        this.temp_features=this.featTable.featl[0]['a']+'='+this.featTable.featl[0]['v']}
        else {this.infotochange = this.featTable.form[0]["v"]+' '+this.featTable.lemma[0]["v"]+' '+this.featTable.pos[0]["v"]+' '+this.featTable.gloss[0]['v']+' '
        for (let a in this.featTable.featl){this.tempfeat += this.featTable.featl[a]["a"]+'='+this.featTable.featl[a]['v']
          if (a < this.featTable.featl.length-1){this.tempfeat+='|'}}
        this.infotochange+= this.tempfeat
        this.temp_features+=this.tempfeat
        }}
      this.tempfeat=''
      // console.log(555555,this.infotochange)

    },

    replaceEntry(){
    if(this.infotochange !=""){
    this.data[this.indexfeat].changed='delete'
    var newRow = {
        form:this.featTable.form[0]['v'],
        lemma:this.featTable.lemma[0]['v'],
        POS:this.featTable.pos[0]['v'],
        features: this.temp_features,
        gloss: this.featTable.gloss[0]['v'],
        changed:'replace',
        key:this.featTable.form[0]['v']+this.featTable.lemma[0]['v']+this.featTable.pos[0]['v']+this.temp_features+this.featTable.gloss[0]['v']
      };
      // console.log(333666999,newRow)
      //console.log(321321321, this.temp_features)
      this.data.splice(this.indexfeat+1,0, newRow)
      if(this.infotochange != ""){
      this.RulesGrew.push({currentInfo:this.currentinfo, info2Change:this.infotochange})}
      // console.log(123, this.currentinfo, this.infotochange, this.RulesGrew)
      }
      
    else{this.showNotif('top', 'noModification');}
    },
    // getProjectConfig(){
    //       var conf = this.$store.getters.getProjectConfig;
    //       // console.log(666666,conf)
    //       this.options.annof = conf.annotationFeatures;
    //       this.options.shownfeatures = conf.shownfeatures;
    //       this.options.shownmeta = conf.shownmeta;
    //       // console.log(this.options.annof)
    //       // console.log(123123,this.options.annof.UPOS)
    //       this.options.catoptions.push({'name':'POS', 'values':this.options.annof.UPOS})
    //       // console.log(777777, this.options.catoptions)
    //     },

    deleteSelected(){
      let self = this;
      this.table.selected.filter(function(item){
          self.data.splice(self.data.indexOf(item), 1);
          return item;
      });
      this.table.selected = [];
    },
    onRowClick (evt, row) {
      this.someFeatureChanged=false;
      this.infotochange='';
      this.currentword = row.form;
      this.openFeatures = true;
      this.featTable.featl = [];
      this.featTable.form = [{'a':'Form', 'v':row.form}];
      this.featTable.pos = [{'a':'POS', 'v':row.POS}];
      this.featTable.lemma = [{'a':'Lemma', 'v':row.lemma}];
      this.featTable.gloss = [{'a':'Gloss', 'v':row.gloss}];
      this.indexfeat =this.data.indexOf(row)
      this.featTable.changed=row.changed;
      if (row.features == '_'){this.featTable.featl = []}
      else {
      for (let a in row.features.split("|")) { 
        {this.featTable.featl.push({'a':row.features.split("|")[a].split("=")[0],'v':row.features.split("|")[a].split("=")[1]})}
       }
      }
      // console.log(this.featTable.form)
      // console.log(this.featTable.pos)
      // console.log(this.featTable.lemma)
      // console.log(this.featTable.gloss)
      // console.log(this.featTable.featl)
      //console.log(this.featTable.lemma)
      if (row.features == '_'){this.currentinfo = row.form+' '+row.lemma+' '+row.POS+' '+row.gloss+' _'}
      else { 
        this.currentinfo = row.form+' '+row.lemma+' '+row.POS+' '+row.gloss+' '+row.features
        }
      //console.log(111,this.currentinfo)

    },
    exportLexiconTSV(){
      for (let i = 0; i < this.data.length; i++){
        if (this.data[i]['changed']!= 'delete' && this.data[i]['changed']!= 'replace'){
          if(!('frequency' in this.data[i])) {this.data[i].frequency = '_'}
          this.download.push(this.data[i])
        }
      }
      var datasample = { data: this.download};
      api.exportLexiconTSV(this.$route.params.projectname, datasample)
      .then( response => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/tab-separated-values" }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'lexicon_'+this.$route.params.projectname+'.tsv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.table.exporting = false;
          this.$q.notify({message:`File downloaded`});
          return [];
      }).catch(error => {
          // this.$q.notify({message:`${error}`, color:'negative'});
          this.$store.dispatch("notifyError", {error: error});
          return [];
      });
      this.download = [];
    },
    exportLexiconJSON(){
      for (let i = 0; i < this.data.length; i++){
        if (this.data[i]['changed']!= 'delete' && this.data[i]['changed']!= 'replace'){
          if(!('frequency' in this.data[i])) {this.data[i].frequency = '_'}
          this.download.push(this.data[i])
        }
      }
      var datasample = { data: this.download};
      // console.log(123,this.$refs.table.computedRows)
      // console.log(datasample)       
      api.exportLexiconJSON(this.$route.params.projectname, datasample)
      .then( response => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/json" }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'lexicon_'+this.$route.params.projectname+'.json');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.table.exporting = false;
          this.$q.notify({message:`File downloaded`});
          return [];
      }).catch(error => {
          // this.$q.notify({message:`${error}`, color:'negative'});
          this.$store.dispatch("notifyError", {error: error});
          return [];
      });
      this.download = [];

    },
    showNotif (position, alert) {
            const { color, textColor, multiLine, icon, message, avatar, actions } = this.alerts[alert];
            const buttonColor = color ? 'white' : void 0;
            this.$q.notify({
                color,
                textColor,
                icon: icon,
                message,
                position,
                avatar,
                multiLine,
                actions: actions,
                timeout: 2000
            })
        }
    }
  }
  

</script>