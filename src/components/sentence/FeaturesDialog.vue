<template>
  <q-dialog v-model="featuresDialogOpened">
    <q-card style="width: 40vw">
      <q-bar class="bg-primary text-white sticky-bar">
        <div class="text-weight-bold">{{ $t('attributeTable.features') }} "{{ token['FORM'] }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>

      <q-card-section class="q-gutter-md">
        <q-input 
          outlined 
          v-model="form" 
          label="FORM" 
          :rules="[(val) => (val && val.length > 0) || $t('attributeTable.form')]"
          />
        <q-input 
          outlined 
          v-model="lemma" 
          label="LEMMA" 
          :rules="[(val) => (val && val.length > 0) || $t('attributeTable.lemma')]"
          />
        <q-separator />
      </q-card-section>

      <q-card-section class="scroll q-gutter-md">
        <AttributeTable
          :featActualData="featTable.feat"
          :columns="featTable.columns"
          :featPossibleOptions="annotationFeatures.FEATS"
          :isCustomizableFeatures="false"
          :isModifiable="true"
          title="Universal Features"
        ></AttributeTable>

        <AttributeTable
          :featActualData="featTable.misc"
          :columns="featTable.columns"
          :featPossibleOptions="annotationFeatures.MISC ? annotationFeatures.MISC : {}"
          :isCustomizableFeatures="true"
          :isModifiable="true"
          title="Miscellaneous Features"
        ></AttributeTable>
        <q-separator />
      </q-card-section>

      <q-card-section>
        <q-expansion-item
          expand-separator
          label="Edit tokens"
        >
          <TokensReplaceDialog
            :sentence-bus="sentenceBus"
            :reactive-sentences-obj="reactiveSentencesObj"
            :token="token"
            :user-id="userId"
            @reload="featuresDialogOpened = false"
          >
          </TokensReplaceDialog>
        </q-expansion-item>
      </q-card-section>

      <q-card-actions class="sticky-card-actions" align="around">
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
          :disable="disableBtn"
          />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { emptyTokenJson, sentenceConllToJson } from 'conllup/lib/conll';
import { mapState, mapActions } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useTreesStore } from 'src/pinia/modules/trees';

import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { PropType, defineComponent } from 'vue';

import AttributeTable from './AttributeTable.vue';
import TokensReplaceDialog from './TokensReplaceDialog.vue';

export default defineComponent({
  components: {
    AttributeTable,
    TokensReplaceDialog,
  },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    reactiveSentencesObj: {
      type: Object as PropType<reactive_sentences_obj_t>,
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
    disableBtn() {
      return this.form === '' || this.lemma === '';
    },
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
    ...mapActions(useTreesStore, ['generateNewMetaText']),
    onFeatureDialogOk() {
      const newToken = emptyTokenJson();

      newToken.FORM = this.form.normalize('NFC');
      newToken.LEMMA = this.lemma.normalize('NFC');

      newToken.FEATS = this.featTable.feat.reduce((obj, r) => {
        if (r.v) (obj as { [key: string]: string })[r.a] = r.v;
        return obj;
      }, {});

      newToken.MISC = this.featTable.misc.reduce((obj, r) => {
        if (r.v) (obj as { [key: string]: string })[r.a] = r.v;
        return obj;
      }, {});

      newToken.ID = this.token.ID;
      newToken.HEAD = this.token.HEAD;  
      newToken.DEPREL = this.token.DEPREL;
      newToken.DEPS = this.token.DEPS;
      newToken.XPOS = this.token.XPOS;
      newToken.UPOS = this.token.UPOS;

      this.reactiveSentencesObj[this.userId].state.treeJson.nodesJson[newToken.ID] = { ...newToken };
      const sentenceJson = sentenceConllToJson(this.reactiveSentencesObj[this.userId].exportConll());
      const newMetaJson = this.generateNewMetaText(sentenceJson);

      this.sentenceBus.emit('tree-update:sentence', {
        sentenceJson: {
          metaJson: newMetaJson,
          treeJson: this.reactiveSentencesObj[this.userId].state.treeJson,
        },
        userId: this.userId,
      });
    },
  },
});
</script>
