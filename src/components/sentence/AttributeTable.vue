<template>
  <div class="table">
    <q-table
      flat
      bordered
      separator="vertical"
      hide-header
      :title="title"
      :rows="featActualData"
      :columns="columns"
      row-key="name"
      :pagination="pagination"
      hide-no-data
      :hide-bottom="title === 'Form' || title === 'Lemma'"
    >
      <template v-if="isModifiable === true" #top-right>
        <q-btn color="primary" round size="s" dense icon="add" @click="addNewFeature()">
          <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('attributeTable.addFeature') }}</q-tooltip>
        </q-btn>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td key="a" :props="props" style="width: 150px">
            <div v-if="props.row.a !== ''">
              {{ props.row.a }}
            </div>
            <q-select
              v-else-if="isCustomizableFeatures == true"
              v-model="props.row.a"
              use-input
              input-debounce="1000"
              new-value-mode="add-unique"
              dense
              :options="computeAttributeOptions()"
              :options-sanitize="true"
              @input-value="onInput()"
            />
            <q-select v-else v-model="props.row.a" dense clearable borderless :options="computeAttributeOptions()" />
          </q-td>

          <q-td key="v" :props="props">
            <div v-if="props.row.a === 'timestamp'" class="meta-data">
              {{ getData(props.row.v) }}
            </div>
            <div v-else-if="metadata.includes(props.row.a)" class="meta-data">
              {{ props.row.v }}
            </div>
            <q-input
              v-else-if="computeValueType(props.row) === 'String'"
              v-model="props.row.v"
              filled
              dense
              :rules="[(val) => !!val || 'Field is required']"
              @input-value="onInput()"
            />
            <q-select
              v-else-if="isCustomizableFeatures === true"
              v-model="props.row.v"
              filled
              dense
              use-input
              input-debounce="1000"
              new-value-mode="add-unique"
              clearable
              :options="computeValueOptions(props.row)"
              :options-sanitize="true"
              @input-value="onInput()"
            />
            <q-select
              v-else
              :key="key"
              v-model="props.row.v"
              filled
              dense
              clearable
              :options="computeValueOptions(props.row)"
              @input-value="onInput()"
            >
            </q-select>
          </q-td>
          <q-td v-if="isModifiable === true && !metadata.includes(props.row.a)" key="actions" :props="props">
            <q-btn dense round flat color="grey" icon="delete" @click="deleteFeature(props.row)">
              <q-tooltip :delay="300"> {{ $t('attributeTable.eraseAttribute') }} {{ props.row.a }}</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { date } from 'quasar';
import { defineComponent, PropType } from 'vue';

interface actual_feat_t {
  a: string;
  v: string | number;
}
interface feature_t {
  name: string;
  values: string[] | string;
}

export default defineComponent({
  name: 'AttributeTable',
  props: {
    title: {
      type: String as PropType<string>,
      required: true,
    },
    featActualData: {
      type: Object as PropType<actual_feat_t[]>,
      required: true,
    },
    columns: {
      type: Object as PropType<{}[]>,
      required: true,
    },
    featPossibleOptions: {
      type: Object as PropType<feature_t[]>,
      required: true,
    },
    isCustomizableFeatures: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    isModifiable: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  },
  data() {
    return {
      pagination: {
        rowsPerPage: 0,
      },
      key: 0,
      metadata: ['timestamp', 'user_id', 'sent_id'], // workaround...
    };
  },
  methods: {
    addNewFeature() {
      this.featActualData.push({ a: '', v: '' });
    },
    deleteFeature(row: any) {
      this.featActualData.splice(this.featActualData.map((e) => e.a).indexOf(row.a), 1);
    },
    getData(timestamp: string) {
      const currentDate = Date.now();
      const parsedTimestamp = parseInt(timestamp, 10);
      const diffTime = date.getDateDiff(currentDate, parsedTimestamp, 'days');
      let diffTimestr = '';
      if (diffTime === 0) {
        diffTimestr = `${date.getDateDiff(currentDate, parsedTimestamp, 'hours')} hours ago: `;
      } else if (diffTime > 365) {
        diffTimestr = 'a long time ago: ';
      } else {
        diffTimestr = `${diffTime} days ago: `;
      }
      return diffTimestr + date.formatDate(parsedTimestamp, 'YYYY-MM-DD HH:mm:ss');
    },
    computeAttributeOptions() {
      return this.featPossibleOptions.map(({ name }) => name).filter((n) => !this.featActualData.map(({ a }) => a).includes(n));
    },
    computeValueOptions(row: any) {
      return (this.featPossibleOptions.filter((x) => x.name === row.a)[0] || {}).values;
    },
    computeValueType(row: any) {
      const possibleValue = (this.featPossibleOptions.filter((x) => x.name === row.a)[0] || {}).values;
      if (possibleValue && possibleValue instanceof Array) return possibleValue;
      return 'String';
    },
    onInput() {
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
