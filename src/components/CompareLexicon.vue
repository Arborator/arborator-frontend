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
    table-style="max-height:80vh">
    <template v-slot:top-right>
      <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template v-slot:body-cell="props">
      
      <td v-if="props.row.type=='In the two dictionaries with the same information'" style="background: mediumseagreen">{{props.value}}</td>
      <td v-else-if="props.row.type=='Identical form in both dictionaries with different information'" style="background: orange">{{props.value}}</td>
      <td v-else-if="props.row.type=='Only in the old dictionary'" style="background: #7EF0CC">{{props.value}}</td>
      <td v-else-if="props.row.type=='Only in the imported dictionary'" style="background: #FAA5CB">{{props.value}}</td>

    </template>

    </q-table>
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
  name: "CompareLexicon",
  props: ["data"],
  component: {
    GrewRequestCard
    },

  data() {
    return {
      featCheck: false,
      RulesGrew:[],
      currentinfo: '',
      infotochange: '',
      searchDialog: false,
      resultSearchDialog:false,
      resultSearch: {},
        table:{
            columns:[
                { name: 'form', label:'Form', sortable: true, align: 'left', field: 'form'},
                { name: 'lemma', label: 'Lemma', sortable: true, align: 'left', field: 'lemma' },
                { name: 'pos', label: 'POS', sortable: true, align: 'left', field: 'POS' },
                { name: 'features', label: 'Features', sortable: true, align: 'left', field: 'features' },
                { name: 'gloss', label: 'Gloss', sortable: true, align: 'left', field: 'gloss' },
                { name: 'key', label: 'Key', sortable: true, align: 'left', field: 'key' },
                { name: 'type', label: 'Type', sortable: true, align: 'left', field: 'type' },
                { name: 'toChange', label: 'Difference', sortable:false, align: 'left', field:'toChange'}
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
                'onlyDifference': { color: 'negative', message: 'Select only those who have a difference'}
      },
    };
  },
  mounted() {

  },
  methods: {
    changeLexicon(){
      // console.log(123, this.table.selected)
      // console.log(123, this.table.selected[0]['toChange'])
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
        console.log(123, this.table.selected)
        for (let i = 0; i < this.table.selected.length; i++){
          if (this.table.selected[i]['features'] == '_'){ 
            this.currentinfo = this.table.selected[i]['form']+' '+this.table.selected[i]['lemma']+' '+this.table.selected[i]['POS']+' '+this.table.selected[i]['gloss']+' _';
          }
          else { 
            this.currentinfo = this.table.selected[i]['form']+' '+this.table.selected[i]['lemma']+' '+this.table.selected[i]['POS']+' '+this.table.selected[i]['gloss']+ ' '+this.table.selected[i]['features']
            }
          this.infotochange = this.table.selected[i]['toChange']
          this.RulesGrew.push({currentInfo:this.currentinfo, info2Change:this.infotochange})
        }
        console.log(123123123, this.RulesGrew)
        this.getRulesGrew();
      }
      else{
        this.showNotif('top', 'onlyDifference');
      }
      this.table.selected = [];
      this.featCheck = false;
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
    },
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
    onTryRules(searchPattern, rewriteCommands) {
      console.log(12121, searchPattern, rewriteCommands);
      console.log("ok");
      var query = { pattern: searchPattern, rewriteCommands: rewriteCommands };
      api
        .tryRulesProject(this.$route.params.projectname, query)
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
  }
};
</script>
