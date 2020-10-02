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

    <template v-slot:body-cell="props">
      
      <td v-if="props.row.type=='In the two dictionaries with the same information'" style="background: mediumseagreen">{{props.value}}</td>
      <td v-else-if="props.row.type=='In the two dictionaries with different information'" style="background: orange">{{props.value}}</td>
      <td v-else-if="props.row.type=='Only in the old dictionary'" style="background: #7EF0CC">{{props.value}}</td>
      <td v-else-if="props.row.type=='Only in the imported dictionary'" style="background: #FAA5CB">{{props.value}}</td>

    </template>

    </q-table>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "CompareLexicon",
  props: ["data"],

  data() {
    return {
        table:{
            columns:[
                { name: 'form', label:'Form', sortable: true, align: 'left', field: 'form'},
                { name: 'lemma', label: 'Lemma', sortable: true, align: 'left', field: 'lemma' },
                { name: 'pos', label: 'POS', sortable: true, align: 'left', field: 'POS' },
                { name: 'features', label: 'Features', sortable: true, align: 'left', field: 'features' },
                { name: 'gloss', label: 'Gloss', sortable: true, align: 'left', field: 'gloss' },
                { name: 'key', label: 'Key', sortable: true, align: 'left', field: 'key' },
                { name: 'type', label: 'Type', sortable: true, align: 'left', field: 'type' }
            ],                
        visibleColumns: ['form', 'lemma', 'pos', 'features', 'gloss', 'type'],
        filter: '',
        pagination: {
            sortBy: 'name',
            descending: false,
            page: 1,
            rowsPerPage: 10
        },
      },
      tableKey: 0,

    };
  },
  mounted() {

  },
  methods: {

  }
};
</script>