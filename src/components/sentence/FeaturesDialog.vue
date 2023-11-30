<template>
  <q-dialog v-model="featuresDialogOpened">
    <q-card>
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">{{ $t('attributeTable.features') }} "{{ token['FORM'] }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>

      <q-card-section class="q-gutter-md">
        <q-input outlined v-model="form" label="FORM" />
        <q-input outlined v-model="lemma" label="LABEL" />
        <q-separator />
      </q-card-section>

      <q-card-section style="max-height: 70vh" class="scroll q-gutter-md">
        <AttributeTable
          :featdata="featTable.feat"
          :columns="featTable.columns"
          :feat-options="annotationFeatures.FEATS"
          open-features="false"
          modifiable="true"
          title="Universal Features"
        ></AttributeTable>

        <AttributeTable
          :featdata="featTable.misc"
          :columns="featTable.columns"
          :feat-options="annotationFeatures.MISC ? annotationFeatures.MISC : {}"
          open-features="true"
          modifiable="true"
          title="Miscellaneous Features"
        ></AttributeTable>
      </q-card-section>

      <q-card-actions align="around">
        <q-btn 
          v-close-popup 
          outline
          color="primary"
          :label="$t('cancel')" 
          style="width: 45%; margin-left: auto; margin-right: auto" 
          />
        <q-btn 
          v-close-popup 
          color="primary" 
          label="Ok" 
          style="width: 45%; margin-left: auto; margin-right: auto" 
          @click="onFeatureDialogOk()" 
          />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import conllup from 'conllup';
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { sentence_bus_t } from 'src/types/main_types';
import { PropType, defineComponent } from 'vue';
import AttributeTable from './AttributeTable.vue';

const emptyTokenJson = conllup.emptyTokenJson;

export default defineComponent({
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
    const feat: { a: string; v: string }[] = [];
    const misc: { a: string; v: string }[] = [];
    const token = emptyTokenJson();
    return {
      featuresDialogOpened: false,
      token,
      userId: '',
      form: '',
      lemma: '',
      featTable: {
        feat,
        misc,
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

      this.form = token.FORM;
      this.lemma = token.LEMMA;

      this.featTable.feat = [];
      for (const a in token.FEATS) {
        this.featTable.feat.push({ a, v: token.FEATS[a] });
      }

      this.featTable.misc = [];
      for (const a in token.MISC) {
        this.featTable.misc.push({ a, v: token.MISC[a] });
      }
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:featuresDialog');
  },
  methods: {
    onFeatureDialogOk() {
      this.token.FEATS = this.featTable.feat.reduce((obj, r) => {
        if (r.v) (obj as { [key: string]: string })[r.a] = r.v;
        return obj;
      }, {});
      this.token.MISC = this.featTable.misc.reduce((obj, r) => {
        if (r.v) (obj as { [key: string]: string })[r.a] = r.v;
        return obj;
      }, {});
      this.token.FORM = this.form;
      this.token.LEMMA = this.lemma;
      this.sentenceBus.emit('tree-update:token', {
        token: this.token,
        userId: this.userId,
      });
    },
  },
});
</script>
<style></style>
