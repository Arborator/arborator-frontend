<template>
  <q-dialog v-model="tokensReplaceDialogOpened">
    <q-card>
      <q-bar class="bg-primary text-white" style="height: max-content">
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-list bordered separator>
        <q-item clickable>
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="merge" />
            </q-avatar>
          </q-item-section>
          <q-item-section>Merge</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <q-menu anchor="top end" self="top start">
            <q-list>
              <q-item  clickable v-close-popup @click="tokenReplaceOptions('merge_right')">
                <q-item-section>Merge right</q-item-section>
              </q-item>
              <q-item  clickable v-close-popup @click="tokenReplaceOptions('merge_left')">
                <q-item-section>Merge left</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
        <q-item clickable>
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="add" />
            </q-avatar>
          </q-item-section>
          <q-item-section>Insert</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <q-menu anchor="top end" self="top start">
            <q-list>
              <q-item  clickable v-close-popup @click="tokenReplaceOptions('insert_before')">
                <q-item-section>Insert before</q-item-section>
              </q-item>
              <q-item  clickable v-close-popup @click="tokenReplaceOptions('insert_after')">
                <q-item-section>Insert after</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
        <q-item clickable v-close-popup @click="isShowFusion = true">
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="content_cut" />
            </q-avatar>
          </q-item-section>
          <q-item-section>Split token</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="tokenReplaceOptions('insert')">
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="add" />
            </q-avatar>
          </q-item-section>
          <q-item-section>Insert token</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="tokenReplaceOptions('delete')">
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="delete" />
            </q-avatar>
          </q-item-section>
          <q-item-section>Delete token</q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
  <q-dialog v-model="isShowFusion">
    <q-card style="max-width: 100vw; min-width: 40vw">
      <q-bar class="bg-primary text-white">
        <q-space />
        <div class="text-weight-bold">Split token</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="q-gutter-md" >
          <q-input
            v-model="selection"
            filled
          />
          <q-input v-model="secondToken" filled label="Second token" />
          <q-btn v-close-popup label="Split" color="primary" @click="tokenReplaceOptions('split')" />
        </div>
        </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">

import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { replaceArrayOfTokens } from 'conllup/lib/conll';
import { defineComponent, PropType} from 'vue';
import { tSThisType } from '@babel/types';


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
    const tokensIndexes: number[] = [];
    const tokensForms: string[] = [];
    return {
      tokensReplaceDialog: false,
      tokensReplaceDialogOpened: false,
      tokensForms,
      tokensIndexes,
      startIndex: 0, 
      endIndex: 0,
      selection: '',
      isShowFusion: false,
      userId: '',
      secondToken:'',
      
    };
  },
  mounted() {
    this.sentenceBus.on('open:tokensReplaceDialog', ({ userId, event }) => {
      this.userId = userId;
      if (event.target !== null) {
        this.startIndex = (event.target as HTMLInputElement).selectionStart || 0;
        this.endIndex = (event.target as HTMLInputElement).selectionEnd || 0;
        const sentence = (event.target as HTMLInputElement).value
        if ((sentence[this.startIndex-1] == ' ' || this.startIndex == 0) && sentence[this.endIndex] == ' ')
        {
          this.selection = (event.target as HTMLInputElement).value.substring(this.startIndex, this.endIndex);
          this.selection.includes(' ') ? this.tokensReplaceDialogOpened = false : this.tokensReplaceDialogOpened = true;
        }
      }
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:tokensReplaceDialog');
  },
  methods: {
    tokenReplaceOptions(option: string) {
      const { treeJson } = this.sentenceBus.sentenceSVGs[this.userId];
      const sentenceTokens = Object.values(treeJson.nodesJson).map(({ FORM }) => FORM);
      const spaceAfters = Object.values(treeJson.nodesJson).map(({ MISC }) => ('SpaceAfter' in MISC && MISC.SpaceAfter === 'No' ? 0 : 1));
      let cumulativeLength = 0;
      const tokens = [];
      for (let i = 0; i < sentenceTokens.length; i += 1) {
        tokens.push({
          i: i + 1,
          form: sentenceTokens[i],
          begin: cumulativeLength,
          end: cumulativeLength + sentenceTokens[i].length,
        });
        cumulativeLength += sentenceTokens[i].length + spaceAfters[i];
      }
      const token = tokens.filter((token) => token.begin == this.startIndex && token.end == this.endIndex)[0]
      if (option == 'merge_right'){
        this.tokensForms = [token.form+tokens[token.i].form];
        this.tokensIndexes = [token.i, token.i+1];
      }
      else if (option == 'merge_left'){
        this.tokensForms = [tokens[token.i-2].form+token.form];
        this.tokensIndexes = [token.i-1, token.i];
      }
      else if (option == 'insert_before'){
        this.tokensForms = ["_", token.form];
        this.tokensIndexes = [token.i];
      }
      else if (option == 'insert_after'){
        this.tokensForms = [token.form, "_"];
        this.tokensIndexes = [token.i];
      }
      else if (option == 'delete'){
        this.tokensIndexes = [token.i];
        this.tokensForms = [];
      }
      else { 
        this.tokensIndexes = [token.i];
        this.tokensForms = [this.selection, this.secondToken];
        this.secondToken = '';

      }
     this.tokensReplace();
    },
    tokensReplace() {
      const oldTree = this.reactiveSentencesObj[this.userId].state.treeJson;
      const tokensIndexes = this.tokensIndexes;
      const newTokensForm = this.tokensForms;
      const newTree = replaceArrayOfTokens(oldTree, tokensIndexes, newTokensForm, true);
      const newMetaText = Object.values(newTree.nodesJson)
        .map(({ FORM }) => FORM)
        .join(' ');
      this.sentenceBus.emit('tree-update:tree', {
        tree: newTree,
        userId: this.userId,
      });
      this.sentenceBus.emit('changed:metaText', { newMetaText });
    },
  },
});
</script>
<style></style>
