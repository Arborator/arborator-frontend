<template>
  <!----------------- Start FeaturesDialog ------------------->

  <q-dialog v-model="featuresDialogOpened">
    <!-- :maximized="maximizedToggle" -->
    <!-- @hide="ondialoghide()" @keyup.enter="onFeatureDialogOk()" @keyup.enter="ononefeaturemodified()"-->
    <q-card style="height: 90vh">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">Features of "{{ token['FORM'] }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <AttributeTable
        :featdata="featTable.featl"
        :columns="featTable.columns"
        :feat-options="annotationFeatures.FEATS"
        open-features="false"
        modifiable="true"
        title="Universal Features"
        @feature-changed="informFeatureChanged()"
      ></AttributeTable>
      <q-separator />
      <AttributeTable
        :featdata="featTable.miscl"
        :columns="featTable.columns"
        :feat-options="annotationFeatures.MISC ? annotationFeatures.MISC : {}"
        open-features="true"
        modifiable="true"
        title="Miscellaneous Features"
        @feature-changed="informFeatureChanged()"
      ></AttributeTable
      ><q-separator />
      <AttributeTable
        :featdata="featTable.form"
        :columns="featTable.columns"
        :feat-options="options.formoptions"
        open-features="false"
        modifiable="false"
        title="Form"
        @feature-changed="informFeatureChanged()"
      ></AttributeTable>
      <q-separator />
      <AttributeTable
        :featdata="featTable.lemma"
        :columns="featTable.columns"
        :feat-options="options.lemmaoptions"
        open-features="false"
        modifiable="false"
        title="Lemma"
        @feature-changed="informFeatureChanged()"
      ></AttributeTable>
      <q-separator />
      <q-card-actions align="around">
        <q-btn v-close-popup flat label="Cancel" style="width: 45%; margin-left: auto; margin-right: auto" @click="ondialoghide()" />
        <q-btn v-close-popup color="primary" label="Ok" style="width: 45%; margin-left: auto; margin-right: auto" @click="onFeatureDialogOk()" />
        <!-- :disabled="!someFeatureChanged" -->
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!----------------- END FeaturesDialog ------------------->
</template>
<script lang="ts">
import AttributeTable from './AttributeTable.vue';
import { PropType } from 'vue';
import { sentence_bus_t } from 'src/types/main_types';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { emptyTokenJson } from 'conllup/lib/conll';

export default {
  components: {
    AttributeTable,
  },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
  },
  data() {
    const featl: { a: string; v: string }[] = [];
    const miscl: { a: string; v: string }[] = [];
    const lemma: { a: string; v: string }[] = [];
    const form: { a: string; v: string }[] = [];
    const token = emptyTokenJson();
    return {
      featuresDialogOpened: false,
      token,
      userId: '',
      options: {
        lemmaoptions: [{ name: 'Lemma', values: 'String' }],
        formoptions: [{ name: 'Form', values: 'String' }],
      },
      featTable: {
        featl,
        miscl,
        lemma,
        form,
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
    };
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
  },
  mounted() {
    this.sentenceBus.on('open:featuresDialog', ({ token, userId }) => {
      this.token = token;
      this.userId = userId;
      this.featuresDialogOpened = true;

      this.featTable.featl = [];
      for (const a in token.FEATS) {
        this.featTable.featl.push({ a, v: token.FEATS[a] });
      }
      this.featTable.miscl = [];
      for (const a in token.MISC) {
        this.featTable.miscl.push({ a, v: token.MISC[a] });
      }
      this.featTable.lemma = [{ a: 'Lemma', v: token.LEMMA }];
      this.featTable.form = [{ a: 'Form', v: token.FORM }];
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:featuresDialog');
  },
  methods: {
    informFeatureChanged() {
      console.log('FIXME to implement');
    },
    ondialoghide() {
      console.log('FIXME to implement');
    },
    onFeatureDialogOk() {
      this.token.LEMMA = this.featTable.lemma.reduce(
        (obj, r) => {
          if (r.v) (obj as { [key: string]: string })[r.a] = r.v;
          return obj;
        },
        { Lemma: '' }
      ).Lemma;
      this.token.FORM = this.featTable.form.reduce(
        (obj, r) => {
          if (r.v) (obj as { [key: string]: string })[r.a] = r.v;
          return obj;
        },
        { Form: '' }
      ).Form;
      this.token.FEATS = this.featTable.featl.reduce((obj, r) => {
        if (r.v) (obj as { [key: string]: string })[r.a] = r.v;
        return obj;
      }, {});
      this.token.MISC = this.featTable.miscl.reduce((obj, r) => {
        if (r.v) (obj as { [key: string]: string })[r.a] = r.v;
        return obj;
      }, {});
      this.sentenceBus.emit('tree-update:token', {
        token: this.token,
        userId: this.userId,
      });
    },
  },
};
</script>
<style></style>
