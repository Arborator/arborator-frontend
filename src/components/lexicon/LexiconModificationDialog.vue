<template>
  <q-dialog :model-value="isShowLexiconModification" @update:model-value="hideLexiconModificationDialog()">
    <q-card style="min-width: 500px">
      <q-bar class="bg-primary text-white sticky-bar">
        <div class="text-weight-bold">Features of</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section class="q-gutter-md">
        <q-input v-if="features.includes('form')" outlined v-model="formattedItem.form" label="FORM" />
        <q-input v-if="features.includes('lemma')" outlined v-model="formattedItem.lemma" label="LEMMA" />
        <q-select v-if="features.includes('upos')" outlined v-model="formattedItem.upos" :options="annotationFeatures.UPOS" label="Upos"> </q-select>
        <q-input v-if="features.includes('Gloss')" outlined v-model="formattedItem.gloss" label="Gloss" />
      </q-card-section>
      <q-separator />
      <q-card-section style="max-height: 70vh" class="scroll" v-if="formattedItem.features.length > 0">
        <AttributeTable
          :featActualData="formattedItem.features"
          :columns="columns"
          :isCustomizableFeatures="false"
          :isModifiable="false"
          title="Universal Features"
          :featPossibleOptions="annotationFeatures.FEATS"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions align="around" class="sticky-card-actions">
        <q-btn
          v-close-popup
          color="primary"
          :label="$t('lexicon.replaceEntry')"
          style="width: 45%; margin-left: auto; margin-right: auto"
          @click="replaceEntry()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia';
import { lexiconItem_FE_t, useLexiconStore } from 'src/pinia/modules/lexicon';
import { useProjectStore } from 'src/pinia/modules/project';
import { PropType, defineComponent } from 'vue';

import AttributeTable from '../sentence/AttributeTable.vue';

interface formattedItem_t {
  form: string;
  lemma: string;
  upos: string;
  gloss: string;
  features: { a: string; v: string }[];
  frequency: number;
  key: string;
}

export default defineComponent({
  name: 'LexiconModificationDialog',
  components: {
    AttributeTable,
  },
  props: {
    features: {
      type: Object as PropType<string[]>,
      required: true,
    },
  },
  data() {
    const formattedItem: formattedItem_t = { form: '', lemma: '', upos: '', gloss: '', features: [], frequency: 0, key: '' };
    return {
      formattedItem,
      columns: [
        {
          name: 'a',
          align: 'center',
          label: 'Attribute',
          field: 'a',
          sortable: true,
          style: 'width: 33%',
        },
        {
          name: 'v',
          label: 'Value',
          field: 'v',
          sortable: true,
        },
        {
          name: 'actions',
          label: 'Actions',
          field: '',
          align: 'center',
          style: 'width: 8%',
        },
      ],
    };
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
    ...mapState(useLexiconStore, ['isShowLexiconModification', 'lexiconModificationItemBefore']),
  },
  watch: {
    lexiconModificationItemBefore(newValue) {
      if (Object.keys(newValue).length > 0) {
        this.formattedItem = this.convertLexiconItemToFormattedItem(newValue);
      }
    },
  },
  methods: {
    ...mapActions(useLexiconStore, ['hideLexiconModificationDialog', 'setLexiconModifiedItem', 'addCoupleLexiconItemBeforeAfter']),
    convertLexiconItemToFormattedItem(lexiconItem: lexiconItem_FE_t) {
      const formattedItem: formattedItem_t = { form: '', lemma: '', upos: '', gloss: '', features: [], frequency: 0, key: '' };
      formattedItem.form = lexiconItem.feats.form;
      formattedItem.lemma = lexiconItem.feats.lemma;
      formattedItem.upos = lexiconItem.feats.upos;
      formattedItem.gloss = lexiconItem.feats.Gloss;
      formattedItem.frequency = lexiconItem.freq;
      formattedItem.key = lexiconItem.key;
      for (const feature of this.annotationFeatures.FEATS) {
        if (feature.name in lexiconItem.feats) {
          formattedItem.features.push({ a: feature.name, v: lexiconItem.feats[feature.name] });
        }
      }
      return formattedItem;
    },
    convertFormattedItemToLexiconItem(formattedItem: formattedItem_t) {
      const features: { [key: string]: string } = {};
      for (const keyValue of formattedItem.features) {
        features[keyValue.a] = keyValue.v;
      }
      const lexiconItem: lexiconItem_FE_t = {
        feats: {
          form: formattedItem.form,
          lemma: formattedItem.lemma,
          upos: formattedItem.upos,
          Gloss: formattedItem.gloss,
          ...features,
        },
        freq: formattedItem.frequency,
        key: formattedItem.key,
      };
      return lexiconItem;
    },
    replaceEntry() {
      const modifiedLexiconItem = this.convertFormattedItemToLexiconItem(this.formattedItem);
      this.setLexiconModifiedItem(modifiedLexiconItem);
      this.addCoupleLexiconItemBeforeAfter();
    },
  },
});
</script>
