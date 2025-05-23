<template>
  <q-list bordered separator>
    <q-item clickable>
      <q-item-section avatar>
        <q-avatar>
          <q-icon name="merge" />
        </q-avatar>
      </q-item-section>
      <q-item-section>{{ $t('tokenReplaceDialog.merge') }}</q-item-section>
      <q-item-section side>
        <q-icon name="keyboard_arrow_right" />
      </q-item-section>
      <q-menu anchor="top end" self="top start">
        <q-list>
          <q-item
            v-if="token.ID !== '1'" 
            clickable 
            v-close-popup 
            @click="tokenReplaceOptions('merge_left')"
          >
            <q-item-section>{{ $t('tokenReplaceDialog.mergeOptions[0]') }}</q-item-section>
          </q-item>
          <q-item 
            v-if="parseInt(token.ID) !== sentenceLength"
            clickable 
            v-close-popup 
            @click="tokenReplaceOptions('merge_right')"
          >
            <q-item-section>{{ $t('tokenReplaceDialog.mergeOptions[1]') }}</q-item-section>
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
      <q-item-section>{{ $t('tokenReplaceDialog.insert') }}</q-item-section>
      <q-item-section side>
        <q-icon name="keyboard_arrow_right" />
      </q-item-section>
      <q-menu anchor="top end" self="top start">
        <q-list>
          <q-item clickable v-close-popup @click="tokenReplaceOptions('insert_before')">
            <q-item-section>{{ $t('tokenReplaceDialog.insertOptions[0]') }}</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="tokenReplaceOptions('insert_after')">
            <q-item-section>{{ $t('tokenReplaceDialog.insertOptions[1]') }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-item>
    <q-item clickable @click="isShowFusion = true">
      <q-item-section avatar>
        <q-avatar>
          <q-icon name="content_cut" />
        </q-avatar>
      </q-item-section>
      <q-item-section>{{ $t('tokenReplaceDialog.split') }}</q-item-section>
    </q-item>
    <q-item clickable @click="onlyMultiword = true">
      <q-item-section>
        <q-avatar>
          <q-icon name="control_point_duplicate" />
        </q-avatar>
      </q-item-section>
      <q-item-section>Add multiWordToken</q-item-section>
    </q-item>
    <q-item clickable v-close-popup @click="tokenReplaceOptions('delete')">
      <q-item-section avatar>
        <q-avatar>
          <q-icon name="delete" />
        </q-avatar>
      </q-item-section>
      <q-item-section>{{ $t('tokenReplaceDialog.delete') }}</q-item-section>
    </q-item>
  </q-list>
  <q-dialog v-model="isShowFusion">
    <q-card style="max-width: 100vw; min-width: 40vw">
      <q-bar class="bg-primary text-white">
        <q-space />
        <div class="text-weight-bold">{{ $t('tokenReplaceDialog.split') }}</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="q-gutter-md">
          <q-input dense outlined readonly v-model="selectedToken" :label="$t('tokenReplaceDialog.selectedToken')" />
          <q-input dense outlined v-model="firstToken" :label="$t('tokenReplaceDialog.firstToken')" />
          <q-input dense outlined v-model="secondToken" :label="$t('tokenReplaceDialog.secondToken')" />
          <q-checkbox v-model="isMultiword" :label="$t('tokenReplaceDialog.multiWordToken')"></q-checkbox>
          <q-input dense outlined v-if="isMultiword" v-model="multiWordToken" :label="$t('tokenReplaceDialog.multiWord')" />
          <div class="row q-gutter-md justify-center">
            <q-btn :disable="!firstToken && !secondToken" v-close-popup label="Split" color="primary" @click="tokenReplaceOptions('split')" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="onlyMultiword">
    <q-card style="max-width: 100vw; min-width: 40vw">
      <q-bar class="bg-primary text-white">
        <q-space />
        <div class="text-weight-bold">Add multiword token</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="q-gutter-md">
          <q-input dense outlined v-model="multiWordToken" :label="$t('tokenReplaceDialog.multiWord')" />
          <div class="row q-gutter-md justify-center">
            <q-btn :disable="multiWordToken == ''" v-close-popup label="Add multiword" color="primary" @click="addMultitoken()" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { replaceArrayOfTokens, sentenceConllToJson, tokenJson_T } from 'conllup/lib/conll';
import { mapActions } from 'pinia';
import { useTreesStore } from 'src/pinia/modules/trees';

import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { PropType, defineComponent } from 'vue';

export default defineComponent({
  name: 'TokensReplaceDialog',
  emits: ['reload'],
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    reactiveSentencesObj: {
      type: Object as PropType<reactive_sentences_obj_t>,
      required: true,
    },
    userId: {
      type: String as PropType<string>,
      required: true,
    }, 
    token: {
      type: Object as PropType<tokenJson_T>,
      required: true,
    }
  },
  data() {
    const tokensIndexes: number[] = [];
    const tokensForms: string[] = [];
    return {
      tokensForms,
      tokensIndexes,
      isShowFusion: false,
      onlyMultiword: false,
      selectedToken: this.token.FORM,
      multiWordToken: this.token.FORM,
      secondToken: '',
      firstToken: '',
      isMultiword: false,
      saveLemma: false, // TODO: when we insert tokens before or after replaceArrayTokens update of the selected token with it's form so in order to fix this we use this variable
      tokenId: 0,
    };
  },
  computed: {
    sentenceLength() {
     return Object.values(this.sentenceBus.sentenceSVGs[this.userId].treeJson.nodesJson).length;
    }
  },
  methods: {
    ...mapActions(useTreesStore, ['generateNewMetaText']),
    addMultitoken() {
      const newTreeJson = this.sentenceBus.sentenceSVGs[this.userId].treeJson;
      const id = parseInt(this.token.ID);
      const newGroupJson = {
        DEPREL: '_',
        DEPS: {},
        FEATS: {},
        FORM: this.multiWordToken,
        HEAD: -1,
        ID: String(id) + '-' + String(id + 1),
        LEMMA: '_',
        MISC: {},
        UPOS: '_',
        XPOS: '_',
      };
      newTreeJson.groupsJson[newGroupJson.ID] = newGroupJson;
      this.onlyMultiword = false;
      this.sentenceBus.emit('tree-update:tree', {
        tree: newTreeJson,
        userId: this.userId,
      });
      this.$emit('reload');
    },
    tokenReplaceOptions(option: string) {
      const { treeJson } = this.sentenceBus.sentenceSVGs[this.userId];
      const tokens = treeJson.nodesJson;
      const id = parseInt(this.token.ID);
      if (option == 'merge_right') {
        this.tokensForms = [this.token.FORM + tokens[`${id +1 }`].FORM];
        this.tokensIndexes = [id, id + 1];
      } else if (option == 'merge_left') {
        this.tokensForms = [tokens[id - 1].FORM + this.token.FORM];
        this.tokensIndexes = [id - 1, id];
      } else if (option == 'insert_before') {
        this.tokensForms = ['_', this.token.FORM];
        this.tokensIndexes = [id];
        this.saveLemma = true;
        this.tokenId = id + 1;
      } else if (option == 'insert_after') {
        this.tokensForms = [this.token.FORM, '_'];
        this.tokensIndexes = [id];
        this.saveLemma = true;
        this.tokenId = id;
      } else if (option == 'delete') {
        this.tokensIndexes = [id];
        this.tokensForms = [];
      } else {
        this.tokensIndexes = [id];
        this.tokensForms = [this.firstToken, this.secondToken];
        this.secondToken = '';
      }
      this.tokensReplace();
    },
    tokensReplace() {
      const oldTree = this.reactiveSentencesObj[this.userId].state.treeJson;
      const tokensIndexes = this.tokensIndexes;
      const newTokensForm = this.tokensForms;
      const newTree = replaceArrayOfTokens(oldTree, tokensIndexes, newTokensForm, true);
      if (this.saveLemma) {
        newTree['nodesJson'][`${this.tokenId}`]['LEMMA'] = this.token.LEMMA;
      }
      if (this.isMultiword) {
        const newGroupJson = {
          DEPREL: '_',
          DEPS: {},
          FEATS: {},
          FORM: this.multiWordToken,
          HEAD: -1,
          ID: String(tokensIndexes[0]) + '-' + String(tokensIndexes[0] + 1),
          LEMMA: '_',
          MISC: {},
          UPOS: '_',
          XPOS: '_',
        };
        newTree['groupsJson'][newGroupJson.ID] = newGroupJson;
      }
      this.sentenceBus.emit('tree-update:tree', {
        tree: newTree,
        userId: this.userId,
      });
      this.$emit('reload');
      const sentenceJson = sentenceConllToJson(this.reactiveSentencesObj[this.userId].exportConll());
      const newMetaJson = this.generateNewMetaText(sentenceJson);
      this.sentenceBus.emit('tree-update:sentence', {
        sentenceJson: {
          metaJson: newMetaJson,
          treeJson: this.sentenceBus.sentenceSVGs[this.userId].treeJson,
        },
        userId: this.userId,
      });
    },
  },
});
</script>
