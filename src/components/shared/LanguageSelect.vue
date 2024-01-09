<template>
  <q-select
    v-model="selectedLanguages"
    @update:model-value="emitSelectedVal"
    outlined
    dense
    use-input
    hide-dropdown-icon
    option-value="name"
    :options="filteredLanguagesList"
    :multiple="multiple"
    stack-label
    emit-value
    :rules="rules"
    :label="$t('createProjectCard.enterLanguage') + label"
    @filter="filterLanguages"
  >
    <template v-slot:selected-item="scope">
      <q-chip v-if="scope.opt.length > 0" removable @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex" dense text-color="primary">
        {{ scope.opt }}
      </q-chip>
    </template>
    <template v-slot:option="scope">
      <q-item v-close-popup v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.name }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

interface language_t {
  index: number;
  name: string;
}
export default defineComponent({
  name: 'LanguageSelect',
  props: {
    multiple: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    languagesList: {
      type: Object as PropType<language_t[]>,
      required: true,
    },
    label: {
      type: String as PropType<string>,
      default: '',
    },
    rules: {
      type: Object as PropType<[]>,
      default: [],
    },
  },
  data() {
    const filteredLanguagesList: language_t[] = [];
    return {
      filteredLanguagesList,
      selectedLanguages: [],
    };
  },
  methods: {
    emitSelectedVal() {
      this.$emit('selected-value', this.selectedLanguages);
    },
    filterLanguages(val: string, update: (callback: () => void) => void) {
      if (val === '') {
        update(() => {
          this.filteredLanguagesList = this.languagesList;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.filteredLanguagesList = this.languagesList.filter((v) => v.name.toLowerCase().indexOf(needle) > -1);
      });
    },
  },
});
</script>
