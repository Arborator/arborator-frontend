<template>
  <div class="table">
    <q-table
    ref="table"
    title="Dictionaries"
    :class="($q.dark.isActive?'my-sticky-header-table-dark':'my-sticky-header-table' ) +  ' rounded-borders'"
    :data="this.data"
    :columns="table.columns"
    row-key="key"
    :pagination.sync="table.pagination"
    :filter="table.filter"
    binary-state-sort
    :rows-per-page-options="[0]"
    :visible-columns="table.visibleColumns"
    :table-header-class="$q.dark.isActive?'text-white':'text-primary'"
    virtual-scroll
    card-class="shadow-8"
    :key="tableKey"
    selection="multiple"
    :selected.sync="table.selected"
    table-style="max-height:80vh">


    <template v-slot:top-right>
      <q-btn color= "default" flat label="Rule Grew" @click="changeLexicon()" ><q-tooltip :delay="300" content-class="text-white bg-primary">{{$t('projectView').tooltipRuleGrewLexicon}}</q-tooltip></q-btn>
      <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template v-slot:body-cell="props">

      <td v-if="props.row.type=='In the two dictionaries with the same information'" style="background: mediumseagreen">{{props.value}}</td>
      <td v-else-if="props.row.type=='In the two dictionaries with different information'" style="background: orange">{{props.value}}</td>
      <td v-else-if="props.row.type=='Identical form in both dictionaries with different information'" style="background: orange">{{props.value}}</td>
      <td v-else-if="props.row.type=='Only in the old dictionary'" style="background: #7EF0CC">{{props.value}}</td>
      <td v-else-if="props.row.type=='Only in the imported dictionary'" style="background: #FAA5CB">{{props.value}}</td>

    </template>

    </q-table>
    <q-dialog v-model="searchDialog" seamless position="right" full-width>
      <template
        v-if="
          !(
            $store.getters['config/exerciseMode'] &&
            !$store.getters['config/isTeacher']
          )
        "
      >
        <GrewSearch :sentenceCount="this.data.length" :sampleId="this.sampleId" :showTable="this.searchDialog"/>
      </template>
    </q-dialog>
    
      <!-- :totalsents="project.infos.number_sentences" -->
  </div>
</template>

<script>
import Vue from "vue";
import api from '../boot/backend-api';
import { openURL } from 'quasar'
import GrewSearch from "./grewSearch/GrewSearch";
import grewTemplates from '../assets/grew-templates.json';
import { len } from 'snapsvg-cjs';
export default {
  components: { GrewSearch },
  name: "CompareLexicon",
  props: ["data", "sampleId"],
  component: {
    GrewSearch
    },
  data() {
    return {
      RulesApplied: false,
      queries: grewTemplates,
      featCheck: false,
      currentinfo: '',
      infotochange: '',
      searchDialog: false,
      resultSearchDialog:false,
      resultSearch: {},
        table:{
            columns:[
                { name: 'form', label:'Form', sortable: true, align: 'left', field: 'form'},
                { name: 'lemma', label:'Lemma', sortable: true, align: 'left', field: 'lemma'},
                { name: 'pos', label:'POS', sortable: true, align: 'left', field: 'POS'},
                { name: 'features', label: 'Features', sortable: true, align: 'left', field: 'features' },
                { name: 'gloss', label: 'Gloss', sortable: true, align: 'left', field: 'gloss' },
                { name: 'key', label: 'Key', sortable: true, align: 'left', field: 'key' },
                { name: 'type', label: 'Type', sortable: true, align: 'left', field: 'type' },
                { name: 'toChange', label: 'Difference', sortable:true, align: 'left', field:'toChange'}
            ],                
        visibleColumns: ['form', 'lemma', 'pos', 'features', 'gloss', 'type', 'toChange'],
        filter: '',
        pagination: {
            sortBy: 'name',
            descending: false,
            page: 1,
            rowsPerPage: 10
        },
        selected: [],
      },
      tableKey: 0,
      queries: grewTemplates,
      alerts: { 
                'noRuletoApply': { color: 'negative', message: 'No rule to apply'},
                'onlyDifference': { color: 'negative', message: 'Select only those who have a difference'}
            },
    };
  },
  mounted() {
  },
  methods: {
    changeLexicon(){
      var RulesGrew = [];
      if (this.table.selected.length == 0){
        for (let i = 0; i < this.data.length; i++){
          if (this.data[i]['toChange']!= '_' && this.data[i]['toChange']){
            this.table.selected.push(this.data[i])
          }
        }
      }
      else{
        for (let i = 0; i < this.table.selected.length; i++){
          if (this.table.selected[i]['toChange'] == "_" || !(this.table.selected[i]['toChange'])){
            this.featCheck = true;
          }
        }
      }
      if (this.featCheck == false){
        for (let i = 0; i < this.table.selected.length; i++){
          if (this.table.selected[i]['features'] == '_'){ 
            this.currentinfo = this.table.selected[i]['form']+' '+this.table.selected[i]['lemma']+' '+this.table.selected[i]['POS']+' '+this.table.selected[i]['gloss']+' _';
          }
          else { 
            this.currentinfo = this.table.selected[i]['form']+' '+this.table.selected[i]['lemma']+' '+this.table.selected[i]['POS']+' '+this.table.selected[i]['gloss']+ ' '+this.table.selected[i]['features']
            }
          this.infotochange = this.table.selected[i]['toChange']
          RulesGrew.push({currentInfo:this.currentinfo, info2Change:this.infotochange})
        }
        this.getRulesGrew(RulesGrew);
      }
      else{
        this.showNotif('top', 'onlyDifference');
      }
      this.featCheck = false;
    },
    
    getRulesGrew(RulesGrew){
      if(RulesGrew.length!=0){
        var listSampleIds = "";
        for (let i in this.sampleId){
          if (i < this.sampleId.length-1){
            listSampleIds += this.sampleId[i]["sample_name"] + ", "
          }
          else{
            listSampleIds += this.sampleId[i]["sample_name"]
          }
        }
        var datasample = { data: RulesGrew };
        api.transformation_grew(this.$route.params.projectname, datasample)
        .then(response => {
          if ( this.queries.slice(-1)[0]['name'] != 'Correct lexicon'){
            this.queries.push({"name":"Correct lexicon", "pattern":response.data.rules, "commands":" ", "sampleIds":listSampleIds})
          }
          else (
            this.queries.slice(-1)[0]['pattern'] = response.data.rules, 
            this.queries.slice(-1)[0]['commands'] = " ",
            this.queries.slice(-1)[0]['sampleIds'] = listSampleIds
            )
          }
        )
        this.searchDialog=true;
        }
      else{this.showNotif('top', 'noRuletoApply');}
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
};
</script> 