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
      hide-no-data
      :rows-per-page-options="[0]"
      hide-pagination
    >
      <template v-if="isModifiable === true" #top-right>
        <q-btn color="primary" round size="s" dense icon="add" @click="addNewFeature()">
          <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('attributeTable.addFeature') }}</q-tooltip>
        </q-btn>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td key="a" :props="props">
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
            <q-select v-else v-model="props.row.a" dense borderless :options="computeAttributeOptions()" @update:model-value="computeValue(props.row)" />
          </q-td>

          <q-td key="v" :props="props">
            <q-input
              v-if="computeValueType(props.row) === 'String'"
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
              :options="computeValueOptions(props.row)"
              :options-sanitize="true"
              @input-value="onInput()"
            />
            <q-select
              v-else-if="computeValueOptions(props.row) !== undefined && computeValueOptions(props.row).length === 1"
              v-model="props.row.v"
              dense
              filled
              readonly
              hide-dropdown-icon
            >
            </q-select>
            <q-select
              v-else
              :key="key"
              v-model="props.row.v"
              filled
              dense
              :options="computeValueOptions(props.row)"
              @input-value="onInput()"
              :rules="[(val) => (val && val.length > 0) || $t('attributeTable.feat')]"
            >
            </q-select>
          </q-td>
          <q-td v-if="isModifiable" key="actions" :props="props">
            <q-btn dense round flat color="grey" icon="delete" @click="deleteFeature(props.row)">
              <q-tooltip :delay="300"> {{ $t('attributeTable.eraseFeature') }} {{ props.row.a }}</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

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
    };
  },
  methods: {
    addNewFeature() {
      this.featActualData.push({ a: '', v: '' });
    },
    deleteFeature(row: any) {
      this.featActualData.splice(this.featActualData.map((e) => e.a).indexOf(row.a), 1);
    },
    computeAttributeOptions() {
      return this.featPossibleOptions.map(({ name }) => name).filter((n) => !this.featActualData.map(({ a }) => a).includes(n));
    },
    computeValueOptions(row: any) {
      return (this.featPossibleOptions.filter((x) => x.name === row.a)[0] || {}).values;
    },
    computeValue(row: any) {
      if (this.computeValueOptions(row).length === 1) {
        row.v = this.computeValueOptions(row)[0];
      }
    },
    computeValueType(row: any) {
      const possibleValue = (this.featPossibleOptions.filter((x) => x.name === row.a)[0] || {}).values;
      if (possibleValue && possibleValue.length > 0 && possibleValue instanceof Array) return possibleValue;
      return 'String';
    },
    onInput() {
      this.key += 1;
    },
  },
});
</script>
