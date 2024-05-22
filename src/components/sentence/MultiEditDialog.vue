<template>
  <q-dialog v-model="dialogOpened">
    <q-card style="width: 90vh">
      <q-bar class="bg-primary text-white sticky-bar">
        <div class="text-weight-bold">{{ $t('sentenceCard.multiEditDial') }}</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section class="text-h6">
        {{ $t('multiEditDialog.text') }}
      </q-card-section>
      <q-card-section>
        <table v-if="treeJson">
          <tr>
            <th>ID</th>
            <th>TOKEN</th>
            <th v-for="metaLabel in metaLabels" :key="metaLabel">
              {{ metaLabel }}
            </th>
          </tr>
          <tr>
            <th>0</th>
            <th>{{ $t('multiEditDialog.all') }} :</th>
            <td v-for="metaLabel in metaLabels" :key="metaLabel">
              <q-checkbox v-model="checkBoxesAll[metaLabel]" @update:model-value="toggleAll(metaLabel)"></q-checkbox>
            </td>
          </tr>
          <tr>
            <td colspan="8" class="divider"><hr /></td>
          </tr>
          <tr v-for="token of treeJson.nodesJson" :key="token.ID">
            <th>{{ token.ID }}</th>
            <th>{{ token.FORM }}</th>
            <td v-for="metaLabel in metaLabels" :key="metaLabel">
              <q-checkbox v-model="checkBoxes[token.ID][metaLabel]"></q-checkbox>
            </td>
          </tr>
        </table>
      </q-card-section>

      <q-separator />
      <q-card-actions class="sticky-card-actions">
        <q-btn v-close-popup color="primary" outline :label="$t('cancel')" style="margin-left: auto; margin-right: auto" />
        <q-btn v-close-popup color="primary" label="Ok" style="margin-left: auto; margin-right: auto" @click="onDialogOk()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { tokenJson_T } from 'conllup/lib/conll';
import { emptyTreeJson } from 'conllup/lib/conll';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { PropType } from 'vue';
import { defineComponent } from 'vue';

type metaLabel_t = 'UPOS' | 'DEPREL' | 'HEAD' | 'LEMMA' | 'FEATS' | 'MISC';

export default defineComponent({
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
    const treeJson = emptyTreeJson();
    const metaLabels: metaLabel_t[] = ['UPOS', 'DEPREL', 'HEAD', 'LEMMA', 'FEATS', 'MISC'];
    const checkBoxes: { [key: string]: { [key in metaLabel_t]: boolean } } = {};
    return {
      dialogOpened: false,
      userId: '',
      treeJson,
      checkBoxes,
      metaLabels,
      checkBoxesAll: { UPOS: false, DEPREL: false, HEAD: false, LEMMA: false, FEATS: false, MISC: false },
    };
  },
  mounted() {
    this.sentenceBus.on('open:openMultiEditDialog', ({ userId }) => {
      this.userId = userId;
      this.treeJson = JSON.parse(JSON.stringify(this.sentenceBus.sentenceSVGs[this.userId].treeJson));
      for (const metaLabel of this.metaLabels) {
        this.checkBoxesAll[metaLabel] = false;
      }
      for (const token in this.treeJson.nodesJson) {
        const checkBoxesToken: { [key in metaLabel_t]: boolean } = {
          UPOS: false,
          DEPREL: false,
          HEAD: false,
          LEMMA: false,
          FEATS: false,
          MISC: false,
        };
        this.checkBoxes[token] = checkBoxesToken;
      }
      this.dialogOpened = true;
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:openMultiEditDialog');
  },
  methods: {
    onDialogOk() {
      for (const token in this.treeJson.nodesJson) {
        for (const metaLabel of this.metaLabels) {
          const toDeleteBool = this.checkBoxes[token][metaLabel];
          const node = this.treeJson.nodesJson[token] as any;
          if (toDeleteBool) {
            node[metaLabel as keyof tokenJson_T] = '_';
            if (metaLabel === 'HEAD') {
              node.DEPREL = '_';
            }
            if (['FEATS', 'MISC'].includes(metaLabel)) {
              node[metaLabel] = {};
            }
          }
        }
      }
      this.sentenceBus.emit('tree-update:tree', {
        tree: this.treeJson,
        userId: this.userId,
      });
      this.uncheckToggles();
    },
    toggleAll(metaLabel: metaLabel_t) {
      for (const token in this.checkBoxes) {
        this.checkBoxes[token][metaLabel] = this.checkBoxesAll[metaLabel];
      }
    },
    uncheckToggles() {
      for (const metaLabel of this.metaLabels) {
        this.checkBoxesAll[metaLabel] = false;
      }
    },
  },
});
</script>
<style></style>
