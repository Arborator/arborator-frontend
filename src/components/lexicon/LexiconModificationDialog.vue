<template>
  <q-dialog :model-value="isShowLexiconModification" @update:model-value="$store.dispatch('lexicon/hideLexiconModificationDialog')">
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

<script>
import { mapGetters } from 'vuex';
import AttributeTable from '../sentence/AttributeTable';

export default {
  name: 'LexiconModificationDialog',
  components: {
    AttributeTable,
  },
  computed: {
    ...mapGetters('config', ['annotationFeatures']),
    ...mapGetters('lexicon', ['isShowLexiconModification', 'lexiconModificationItemBefore']),
  },
  watch: {
    lexiconModificationItemBefore(newValue) {
      this.formattedItem = this.convertLexiconItemToFormattedItem(newValue);
    },
  },
  data() {
    return {
      formattedItem: {},
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
        annof: [], // = annotationFeatures from conf!!!
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
  mounted() {
    this.options.annof = this.annotationFeatures;
  },
  methods: {
    convertLexiconItemToFormattedItem(lexiconItem) {
      const formattedItem = {};
      formattedItem.form = [{ a: 'Form', v: lexiconItem.form }];
      formattedItem.lemma = [{ a: 'Lemma', v: lexiconItem.lemma }];
      formattedItem.pos = [{ a: 'POS', v: lexiconItem.pos }];
      formattedItem.gloss = [{ a: 'Gloss', v: lexiconItem.gloss }];
      formattedItem.frequency = lexiconItem.frequency;
      formattedItem.key = lexiconItem.key;

      formattedItem.features = [];
      for (const keyValue of Object.entries(lexiconItem.features)) {
        formattedItem.features.push({
          a: keyValue[0],
          v: keyValue[1],
        });
      }
      return formattedItem;
    },
    convertFormattedItemToLexiconItem(formattedItem) {
      const lexiconItem = {};
      lexiconItem.form = formattedItem.form[0].v;
      lexiconItem.lemma = formattedItem.lemma[0].v;
      lexiconItem.pos = formattedItem.pos[0].v;
      lexiconItem.gloss = formattedItem.gloss[0].v;
      lexiconItem.frequency = formattedItem.frequency;
      lexiconItem.key = formattedItem.key;
      lexiconItem.features = {};

      for (const keyValue of formattedItem.features) {
        lexiconItem.features[keyValue.a] = keyValue.v;
      }

      return lexiconItem;
    },
    replaceEntry() {
      const modifiedLexiconItem = this.convertFormattedItemToLexiconItem(this.formattedItem);
      this.$store.dispatch('lexicon/setLexiconModifiedItem', modifiedLexiconItem);
      this.$store.dispatch('lexicon/addCoupleLexiconItemBeforeAfter');
    },
  },
};
</script>

<style></style>
