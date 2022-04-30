<template>
  <q-dialog :model-value="isShowLexiconModification" @update:model-value="hideLexiconModificationDialog()">
    <q-card>
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Features of</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
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
        :featdata="formattedItem.pos"
        :columns="featTable.columns"
        open-features="false"
        modifiable="false"
        title="Category"
        :feat-options="options.catoptions"
      />
      <AttributeTable
        :featdata="formattedItem.features"
        :columns="featTable.columns"
        open-features="false"
        modifiable="true"
        title="Universal Features"
        :feat-options="options.annof.FEATS"
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
  pos: { a: string; v: string }[];
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
    const formattedItem: formattedItem_t = { form: [], lemma: [], pos: [], gloss: [], features: [], frequency: 0, key: '' };

    return {
      formattedItem,
      featTable: {
        form: [],
        pos: [],
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
    lexiconModificationItemBefore(newValue) {
      this.formattedItem = this.convertLexiconItemToFormattedItem(newValue);
    },
  },
  mounted() {
    this.options.annof = this.annotationFeatures;
  },
  methods: {
    ...mapActions(useLexiconStore, ['hideLexiconModificationDialog', 'setLexiconModifiedItem', 'addCoupleLexiconItemBeforeAfter']),
    convertLexiconItemToFormattedItem(lexiconItem: lexiconItem_FE_t) {
      const formattedItem: formattedItem_t = { form: [], lemma: [], pos: [], gloss: [], features: [], frequency: 0, key: '' };
      formattedItem.form = [{ a: 'Form', v: lexiconItem.feats.form }];
      formattedItem.lemma = [{ a: 'Lemma', v: lexiconItem.feats.lemma }];
      formattedItem.pos = [{ a: 'POS', v: lexiconItem.feats.upos }];
      formattedItem.gloss = [{ a: 'Gloss', v: lexiconItem.feats.gloss }];
      formattedItem.frequency = lexiconItem.freq;
      formattedItem.key = lexiconItem.key;

      formattedItem.features = [];

      return formattedItem;
    },
    convertFormattedItemToLexiconItem(formattedItem: formattedItem_t) {
      const features: { [key: string]: string } = {};
      for (const keyValue of formattedItem.features) {
        features[keyValue.a] = keyValue.v;
      }
      const lexiconItem: lexiconItem_FE_t = {
        feats: {
          form: formattedItem.form[0].v,
          lemma: formattedItem.lemma[0].v,
          upos: formattedItem.pos[0].v,
          gloss: formattedItem.gloss[0].v,
          ...features,
        },
        freq: formattedItem.frequency,
        key: formattedItem.key,
      };
      return lexiconItem;
    },
    replaceEntry() {
      const modifiedLexiconItem = this.convertFormattedItemToLexiconItem(this.formattedItem);
      // this.$store.dispatch('lexicon/setLexiconModifiedItem', modifiedLexiconItem);
      // this.$store.dispatch('lexicon/addCoupleLexiconItemBeforeAfter');
      this.setLexiconModifiedItem(modifiedLexiconItem);
      this.addCoupleLexiconItemBeforeAfter();
    },
  },
});
</script>

<style></style>
