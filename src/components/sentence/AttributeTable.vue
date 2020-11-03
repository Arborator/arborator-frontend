<template>
  <div class="table">
    <q-table
      separator="vertical"
      hide-header
      hide-bottom
      dense
      :title="title"
      :data="this.featdata"
      :columns="this.columns"
      row-key="name"
      :pagination.sync="pagination"
    >
      <template v-if="modifiable=='true'" v-slot:top-right>
        <q-btn color="primary" round size="s" dense icon="add" @click="addNewFeature()">
          <q-tooltip :delay="300" content-class="text-white bg-primary">Add a new feature</q-tooltip>
        </q-btn>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">

          <q-td key="a" :props="props"  style="width: 150px">
            <!-- three cases: existing feature -> div, 
            new feature && openFeatures -> modifiable select
            new feature && !openFeatures -> non-modifiable select -->
            <div v-if="props.row.a!=''">
              {{props.row.a}}
            </div>
            <q-select
              v-else-if="openFeatures=='true'"
              clearable
              use-input
              input-debounce="1000"
              new-value-mode="add-unique"
              @input="oninput(props.row)"
              dense            
              v-model="props.row.a"
              :options="computeAttributeOptions(props.row)"
              :options-sanitize="true"
            />
            <q-select
              v-else
              dense
              clearable
              use-input
              borderless
              v-model="props.row.a"
              :options="computeAttributeOptions(props.row)"
            />
          </q-td>

          <q-td key="v" :props="props">
            <div v-if="props.row.a=='timestamp'">
              {{thisdate(props.row.v)}}
            </div>
            <q-input
              v-else-if="computeValueType(props.row)=='Number'"
              v-model.number="props.row.v"
              type="number"
              filled
              dense
              use-input
              @input="oninput(props.row)"
              :rules="[val => !!val || 'Field is required']"
            />
            <q-input
              v-else-if="computeValueType(props.row)=='String'"
              v-model.number="props.row.v"
              filled
              dense
              @input="oninput(props.row)"
              :rules="[val => !!val || 'Field is required']"
            />

            <q-select
              v-else-if="openFeatures=='true'"
              filled
              dense
              v-model="props.row.v"
              use-input
              
              input-debounce="1000"
              new-value-mode="add-unique"
              clearable
              @input="oninput(props.row)"
              :options="computeValueOptions(props.row)"
              :options-sanitize="true"
            />
            <q-select
              v-else
              :key="key"
              filled
              dense
              clearable
              v-model="props.row.v"
              :options="computeValueOptions(props.row)"
              @input="oninput(props.row)"
            >
            <!-- removed fill-input to allow to erase functions -->
            <template v-if='prepend!=undefined' v-slot:prepend>{{props.row.join}}</template>
            </q-select>
          </q-td>
           <q-td  v-if="modifiable=='true'" key='actions' :props="props">
            <q-btn dense round flat color="grey" @click="deleteRow(props.row)" icon="delete">
              <q-tooltip :delay="300" >Erase the attribute {{props.row.a}}</q-tooltip>
            </q-btn>
          </q-td>   
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import Vue from "vue";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";
import { date } from 'quasar'
Vue.component("v-select", vSelect);

export default {
  // components: {date},
  name: "attributeTable",
  props: ["title", "featdata", "columns", "featOptions", "openFeatures", "modifiable", "numbered", "prepend"],
  // featdata contains the actual data, featOptions the possible options, 
  // openFeatures: user can add own attributes, modifiable: user can add and erase a row of attributes
  // numbered is undefined in general. for the token dialog, it contains the currentword
  data() {
    return {
     
      pagination: {
        rowsPerPage: 0 // current rows per page being displayed : 0=All
      },
      key: 0 //workaround...
      
    };
  },
  // computed: {
  //   //  nodata(){ return "no "+this.title; }
  // },
  mounted() {
    // console.log('prepend',this.prepend)
  },
  methods: {

    addNewFeature(){
      // console.log("1addNewFeature",this.featdata)
      if (this.numbered) this.featdata.push({ 'a':this.featdata.length+1, 'v':(this.featdata.length)?'':this.numbered })
      else this.featdata.push({ 'a':'', 'v':'' })
      // console.log("2addNewFeature",this.featdata)
    },

    deleteRow(row){
      this.featdata.splice(this.featdata.map(function(e) { return e.a; }).indexOf(row.a), 1)
      this.$emit("feature-changed");
    },
    thisdate(timestamp){
      if (!timestamp) return 'no'
      let now = Date.now()
      let date1 = new Date(2017, 4, 12)
      let date2 = new Date(2017, 3, 8)
      let diff = date.getDateDiff(now,parseInt(timestamp), 'days')
      let diffstr = ''
      if (diff == 0) diffstr = date.getDateDiff(now,parseInt(timestamp), 'hours')+" hours ago: "
      else if (diff>365) diffstr = 'a long time ago: '
      else diffstr = diff+" days ago: "
      return diffstr+date.formatDate(parseInt(timestamp), 'YYYY-MM-DD HH:mm:ss')
    },
    computeAttributeOptions(row) {
      // for new line, returns all the predefined attributes not yet existing
      // todo: hide completely the q-select, if no selection possible
      // console.log('computeAttributeOptions',this.featOptions)
      // console.log(this.featOptions.map(({ name }) => name).filter(n => !this.featdata.map(({ a }) => a).includes(n)))
      return this.featOptions.map(({ name }) => name).filter(n => !this.featdata.map(({ a }) => a).includes(n))
    },
    computeValueOptions(row) {
      // returns all the predefined values for the given attribute (row.a) or empty list
      var vs = (this.featOptions.filter(x => x.name == row.a)[0] || {})["values"]
      // console.log('vsvsvs',vs)
      if (vs=="String") return [row.v] // "String"
      else if (vs=="Number") return [row.v] // "Number";
      else return vs || [];
    },
    computeValueType(row) {
      var vs = (this.featOptions.filter(x => x.name == row.a)[0] || {})["values"]
      // console.log("computeValueType",vs);
      if (vs && vs instanceof Array) return vs
      if (vs==["Number"]) return "Number"
      else return "String" // if (vs==["String"]) or unknown
     },
    oninput(row) {
      this.$emit("feature-changed");
      this.key++;
    
    },
  

  }
};
</script>