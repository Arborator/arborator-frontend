<template>
  <div class="table">
    <q-table separator="vertical" hide-header :title="title" :rows="featdata" :columns="columns" row-key="name" :pagination="pagination">
      <template v-if="modifiable === 'true'" #top-right>
        <q-btn color="primary" round size="s" dense icon="add" @click="addNewFeature()">
          <q-tooltip :delay="300" content-class="text-white bg-primary">{{$t('attributeTable.addFeature')}}</q-tooltip>
        </q-btn>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td key="a" :props="props" style="width: 150px">
            <!-- three cases: existing feature -> div,
            new feature && openFeatures -> modifiable select
            new feature && !openFeatures -> non-modifiable select -->
            <div v-if="props.row.a !== ''">
              {{ props.row.a }}
            </div>
            <q-select
              v-else-if="openFeatures == 'true'"
              v-model="props.row.a"
              use-input
              input-debounce="1000"
              new-value-mode="add-unique"
              dense
              :options="computeAttributeOptions()"
              :options-sanitize="true"
              @input-value="oninput()"
            />
            <q-select v-else v-model="props.row.a" dense clearable use-input borderless :options="computeAttributeOptions()" />
          </q-td>

          <q-td key="v" :props="props">
            <div v-if="props.row.a === 'timestamp'" class="meta-data">
              {{ thisdate(props.row.v) }}
            </div>
            <div v-else-if="metadata.includes(props.row.a)" class="meta-data">
              {{ props.row.v }}
            </div>
            <q-input
              v-else-if="computeValueType(props.row) === 'Number'"
              v-model.number="props.row.v"
              type="number"
              filled
              dense
              use-input
              :rules="[(val) => !!val || 'Field is required']"
              @input-value="oninput()"
            />
            <q-input
              v-else-if="computeValueType(props.row) === 'String'"
              v-model="props.row.v"
              filled
              dense
              :rules="[(val) => !!val || 'Field is required']"
              @input-value="oninput()"
            />
            <q-select
              v-else-if="openFeatures === 'true'"
              v-model="props.row.v"
              filled
              dense
              use-input
              input-debounce="1000"
              new-value-mode="add-unique"
              clearable
              :options="computeValueOptions(props.row)"
              :options-sanitize="true"
              @input-value="oninput()"
            />
            <q-select
              v-else
              :key="key"
              v-model="props.row.v"
              filled
              dense
              clearable
              :options="computeValueOptions(props.row)"
              @input-value="oninput()"
            >
              <!-- removed fill-input to allow to erase functions -->
              <template v-if="prepend !== undefined" #prepend>{{ props.row.join }}</template>
            </q-select>
          </q-td>
          <q-td v-if="modifiable === 'true' && !metadata.includes(props.row.a)" key="actions" :props="props">
            <q-btn dense round flat color="grey" icon="delete" @click="deleteRow(props.row)">
              <q-tooltip :delay="300"> {{$t('attributeTable.eraseAttribute')}} {{ props.row.a }}</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { date } from 'quasar';

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AttributeTable',
  props: ['title', 'featdata', 'columns', 'featOptions', 'openFeatures', 'modifiable', 'numbered', 'prepend'],
  // featdata contains the actual data, featOptions the possible options,
  // openFeatures: user can add own attributes, modifiable: user can add and erase a row of attributes
  // numbered is undefined in general. for the token dialog, it contains the currentword
  data() {
    return {
      pagination: {
        rowsPerPage: 0, // current rows per page being displayed : 0=All
      },
      key: 0,
      metadata: ['timestamp', 'user_id', 'sent_id', 'text'], // workaround...
    };
  },
  methods: {
    addNewFeature() {
      // console.log("1addNewFeature",this.featdata)
      if (this.numbered) {
        this.featdata.push({
          a: this.featdata.length + 1,
          v: this.featdata.length ? '' : this.numbered,
        });
      } else this.featdata.push({ a: '', v: '' });
      // console.log("2addNewFeature",this.featdata)
    },

    deleteRow(row) {
      this.featdata.splice(this.featdata.map((e) => e.a).indexOf(row.a), 1);
      this.$emit('feature-changed');
    },
    thisdate(timestamp) {
      if (!timestamp) return 'no';
      const now = Date.now();
      const diff = date.getDateDiff(now, parseInt(timestamp, 10), 'days');
      let diffstr = '';
      if (diff === 0) diffstr = `${date.getDateDiff(now, parseInt(timestamp, 10), 'hours')} hours ago: `;
      else if (diff > 365) diffstr = 'a long time ago: ';
      else diffstr = `${diff} days ago: `;
      return diffstr + date.formatDate(parseInt(timestamp, 10), 'YYYY-MM-DD HH:mm:ss');
    },
    computeAttributeOptions() {
      // for new line, returns all the predefined attributes not yet existing
      // todo: hide completely the q-select, if no selection possible
      // console.log('computeAttributeOptions',this.featOptions)
      // console.log(this.featOptions.map(({ name }) => name).filter(n => !this.featdata.map(({ a }) => a).includes(n)))
      return this.featOptions.map(({ name }) => name).filter((n) => !this.featdata.map(({ a }) => a).includes(n));
    },
    computeValueOptions(row) {
      // returns all the predefined values for the given attribute (row.a) or empty list
      const vs = (this.featOptions.filter((x) => x.name === row.a)[0] || {}).values;
      // console.log('vsvsvs',vs)
      if (vs === 'String') return [row.v];
      // "String"
      if (vs === 'Number') return [row.v];
      // "Number";
      return vs || [];
    },
    computeValueType(row) {
      const vs = (this.featOptions.filter((x) => x.name === row.a)[0] || {}).values;
      // console.log("computeValueType",vs);
      if (vs && vs instanceof Array) return vs;
      if (vs === ['Number']) return 'Number';
      return 'String'; // if (vs==["String"]) or unknown
    },
    oninput() {
      this.$emit('feature-changed');
      this.key += 1;
    },
  },
});
</script>
<style>
.meta-data {
  text-align: left;
}
</style>
