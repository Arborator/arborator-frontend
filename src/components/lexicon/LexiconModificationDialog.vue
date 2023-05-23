<template>
  <q-dialog :model-value="isShowLexiconModification" @update:model-value="hideLexiconModificationDialog()">
    <q-card>
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Features of</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section style="max-height: 70vh" class="scroll">
        <AttributeTable
          :featdata="formattedItem.features"
          :columns="featTable.columns"
          open-features="false"
          modifiable="false"
          title="Universal Features"
          :feat-options="options.annof.FEATS"
        />
        <AttributeTable
          :featdata="formattedItem.form"
          :columns="featTable.columns"
          open-features="false"
          modifiable="false"
          title="Form"
          :feat-options="['String']"
        />
        <q-separator />
        <AttributeTable
          :featdata="formattedItem.lemma"
          :columns="featTable.columns"
          open-features="false"
          modifiable="false"
          title="Lemma"
          :feat-options="options.lemmaoptions"
        />
        <AttributeTable
          :featdata="formattedItem.upos"
          :columns="featTable.columns"
          open-features="false"
          modifiable="false"
          title="Category"
          :feat-options="options.catoptions"
        />
        <AttributeTable
          :featdata="formattedItem.gloss"
          :columns="featTable.columns"
          open-features="false"
          modifiable="false"
          title="Gloss"
          :feat-options="['String']"
        />
        <q-separator />
      </q-card-section>
      <q-card-actions align="around">
        <!-- <q-btn flat @click="ondialoghide()" label="Cancel" v-close-popup style="width: 35%; margin-left: auto; margin-right: auto" /> -->
        <!-- <q-btn flat @click="addEntry()" label="Add entry" v-close-popup style="width: 45%; margin-left: auto; margin-right: auto" /> -->
        <q-btn
          v-close-popup
          color="primary"
          label="Replace entry"
          style="width: 45%; margin-left: auto; margin-right: auto"
          @click="replaceEntry()"
        />
        <!-- :loading="exporting" -->
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia';
import AttributeTable from '../sentence/AttributeTable.vue';
import { useLexiconStore, lexiconItem_FE_t } from 'src/pinia/modules/lexicon';
import { useProjectStore } from 'src/pinia/modules/project';
import { annotationFeatures_t } from 'src/api/backend-types';

interface formattedItem_t {
  form: { a: string; v: string }[];
  lemma: { a: string; v: string }[];
  upos: { a: string; v: string }[];
  gloss: { a: string; v: string }[];
  features: { a: string; v: string }[];
  frequency: number;
  key: string;
}

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LexiconModificationDialog',
  components: {
    AttributeTable,
  },
  data() {
    const annof: annotationFeatures_t = {
      META: [],
      UPOS: [],
      XPOS: [],
      FEATS: [],
      MISC: [],
      DEPREL: [],
      DEPS: [],
    };
    const formattedItem: formattedItem_t = { form: [], lemma: [], upos: [], gloss: [], features: [], frequency: 0, key: '' };

    return {
      formattedItem,
      featTable: {
        form: [],
        upos: [],
        featl: [],
        miscl: [],
        lemma: [],
        gloss: [],
        changed: null,
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
      },
      options: {
        // attribute table dialog specific stuff
        annof, // = annotationFeatures from conf!!!
        annofFEATS: {}, // obj version (instead of list)
        annofMISC: {}, // obj version (instead of list)
        splitregex: '',
        relav: [],
        currentoptions: [],
        extendedrel: false,
        lemmaoptions: [{ name: 'Lemma', values: 'String' }],
        catoptions: [],
      },
    };
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
    ...mapState(useLexiconStore, ['isShowLexiconModification', 'lexiconModificationItemBefore']),
  },
  watch: {
    lexiconModificationItemBefore(newValue, oldValue) {
      console.log(newValue)
      if (Object.keys(newValue).length > 0) {
        this.formattedItem = this.convertLexiconItemToFormattedItem(newValue);
      }
    },
  },
  mounted() {
    this.options.annof = this.annotationFeatures;
  },
  methods: {
    ...mapActions(useLexiconStore, ['hideLexiconModificationDialog', 'setLexiconModifiedItem', 'addCoupleLexiconItemBeforeAfter']),
    convertLexiconItemToFormattedItem(lexiconItem: lexiconItem_FE_t) {
      const formattedItem: formattedItem_t = { form: [], lemma: [], upos: [], gloss: [], features: [], frequency: 0, key: '' };
      formattedItem.form = lexiconItem.feats.form ? [{ a: 'Form', v: lexiconItem.feats.form }] : [];
      formattedItem.lemma = lexiconItem.feats.lemma ? [{ a: 'Lemma', v: lexiconItem.feats.lemma }] : [];
      formattedItem.upos = lexiconItem.feats.upos ? [{ a: 'Upos', v: lexiconItem.feats.upos }] : [];
      formattedItem.gloss = lexiconItem.feats.Gloss ? [{ a: 'Gloss', v: lexiconItem.feats.Gloss }] : [];
      formattedItem.frequency = lexiconItem.freq;
      formattedItem.key = lexiconItem.key;
      for (const feature of this.options.annof.FEATS) {
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
          form: formattedItem.form.length > 0 ? formattedItem.form[0].v : '',
          lemma: formattedItem.lemma.length > 0 ? formattedItem.lemma[0].v : '',
          upos: formattedItem.upos.length > 0 ? formattedItem.upos[0].v : '',
          Gloss: formattedItem.gloss.length > 0 ? formattedItem.upos[0].v : '',
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

<style></style>
