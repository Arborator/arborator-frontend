<template>
  <q-dialog v-model="showDial" maximized>
    <q-card style="min-width: 100%" class="custom-frame1">
      <q-bar class="bg-primary text-white sticky-bar">
        <q-space />
        <q-btn v-close-popup flat dense icon="close" @click="closeDialog" />
      </q-bar>
      <q-card-section>
        <div class="row text-h6">
          {{ $t('sentenceSegmentation.title') }}
        </div>
        <div class="row text-caption">
          {{ $t('sentenceSegmentation.splitSentenceHint') }}
        </div>
      </q-card-section>
      
      <!-- split sentences -->
      <q-card-section v-if="segmentationOption === 'SPLIT'">
        <div class="row">
          <q-chip class="text-center" :color="$q.dark.isActive ? 'grey' : ''" dense> {{ sentId }} </q-chip>
          {{ sentence }}
        </div>
        <div style="overflow: auto" class="custom-frame2">
          <VueDepTree
            :card-id="1"
            :conll="reactiveSentencesObj[userId].exportConll()"
            :reactive-sentence="reactiveSentencesObj[userId]"
            :reactive-sentences-obj="reactiveSentencesObj"
            :diff-mode="'NO_DIFF'"
            :sentence-bus="sentenceBus"
            :tree-user-id="userId"
            :has-pending-changes="hasPendingChanges"
            :is-split-dial="true"
          >
          </VueDepTree>
        </div>
        <!-- Show split results -->
        <div v-if="showResults">
          <div class="row q-gutter-md">
            <div class="col">
              <div class="text-body2">
                <span class="text-grey"> 1 </span>
                {{ firstReactiveSentence[userId].state.metaJson.text }}
              </div>
              <div class="custom-frame2" style="overflow: auto">
                <VueDepTree
                  :key="forceRender"
                  :card-id="2"
                  :conll="firstReactiveSentence[userId].exportConll()"
                  :reactive-sentence="firstReactiveSentence[userId]"
                  :reactive-sentences-obj="firstReactiveSentence"
                  :diff-mode="'NO_DIFF'"
                  :sentence-bus="sentenceBus"
                  :tree-user-id="userId"
                  :has-pending-changes="hasPendingChanges"
                  :interactive="false"
                >
                </VueDepTree>
              </div>
            </div>
            <div class="col">
              <div class="text-body2">
                <span class="text-grey"> 2 </span>
                {{ secondReactiveSentence[userId].state.metaJson.text }}
              </div>
              <div class="custom-frame2" style="overflow: auto">
                <VueDepTree
                  :key="forceRender"
                  :card-id="2"
                  :conll="secondReactiveSentence[userId].exportConll()"
                  :reactive-sentence="secondReactiveSentence[userId]"
                  :reactive-sentences-obj="secondReactiveSentence"
                  :diff-mode="'NO_DIFF'"
                  :sentence-bus="sentenceBus"
                  :tree-user-id="userId"
                  :has-pending-changes="hasPendingChanges"
                  :interactive="false"
                >
                </VueDepTree>
              </div>
            </div>
          </div>
          <div class="text-h6">
            {{ $t('sentenceSegmentation.editGeneratedMeta') }}
          </div>
          <div class="row q-gutter-md q-py-md">
            <div class="col q-gutter-sm">
              <q-input 
                v-for="meta in Object.keys(firstReactiveSentence[userId].state.metaJson).filter((key) => key.includes('text'))" 
                dense 
                outlined 
                v-model="firstReactiveSentence[userId].state.metaJson[meta]" 
                :label="meta" 
                />
              <q-input
                dense
                outlined
                v-model="firstReactiveSentence[userId].state.metaJson.sent_id"
                label="sent_id"
                :rules="[
                  (val) => !sortedSentIds.includes(val) || $t('sentenceSegmentation.sentIdWarningMsg[0]'),
                  (val) => val !== secondReactiveSentence[userId].state.metaJson.sent_id || $t('sentenceSegmentation.sentIdWarningMsg[1]'),
                ]"
              />
            </div>
            <div class="col q-gutter-sm">
              <q-input 
                v-for="meta in Object.keys(secondReactiveSentence[userId].state.metaJson).filter((key) => key.includes('text'))" 
                dense 
                outlined 
                v-model="secondReactiveSentence[userId].state.metaJson[meta]" 
                :label="meta" 
                />
              <q-input
                dense
                outlined
                v-model="secondReactiveSentence[userId].state.metaJson.sent_id"
                label="sent_id"
                :rules="[
                  (val) => !sortedSentIds.includes(val) || $t('sentenceSegmentation.sentIdWarningMsg[0]'),
                  (val) => val !== firstReactiveSentence[userId].state.metaJson.sent_id || $t('sentenceSegmentation.sentIdWarningMsg[2]'),
                ]"
              />
            </div>
          </div>
          <div>
            <q-btn
              :disable="disableSaveResultBtn"
              outline
              color="primary"
              icon="save"
              :label="$t('sentenceSegmentation.saveResults')"
              @click="saveSplitResult()"
            />
          </div>
        </div>
      </q-card-section>
      <!-- Merge sentences -->
      <q-card-section v-else>
        <div v-if="segmentationOption === 'MERGE'" class="row q-py-md q-gutter-md">
          <div class="col">
            <q-select
              dense
              outlined
              v-model="mergedSentId"
              :label="$t('sentenceSegmentation.selectMergeLabel')"
              :options="sortedSentIds.filter((sent) => sent !== sentId)"
              @update:model-value="MergeSentences()"
            >
            </q-select>
          </div>
          <div class="col">
            <q-btn
              :disable="mergedSentId == ''"
              flat
              color="primary"
              :label="$t('sentenceSegmentation.showResultBtn')"
              @click="showReactiveSentences()"
            />
          </div>
        </div>
        <div v-if="showResults">
          <div class="row">
            <q-chip class="text-center" :color="$q.dark.isActive ? 'grey' : ''" dense>
              {{ mergedReactiveSentence[userId].state.metaJson.sent_id }}
            </q-chip>
            {{ mergedReactiveSentence[userId].state.metaJson.text }}
          </div>
          <div style="overflow: auto" class="custom-frame2">
            <VueDepTree
              :key="forceRender"
              :card-id="1"
              :conll="mergedReactiveSentence[userId].exportConll()"
              :reactive-sentence="mergedReactiveSentence[userId]"
              :reactive-sentences-obj="mergedReactiveSentence"
              :diff-mode="'NO_DIFF'"
              :sentence-bus="sentenceBus"
              :tree-user-id="userId"
              :has-pending-changes="hasPendingChanges"
              :interactive="false"
            >
            </VueDepTree>
          </div>
          <div class="q-gutter-md q-py-md">
            <div class="row text-h6">
              {{ $t('sentenceSegmentation.proposedMetadata') }}
            </div>
            <q-input 
              class="row"
              v-for="meta in Object.keys(mergedReactiveSentence[userId].state.metaJson).filter((key) => !unchangedMetaData.includes(key))" 
              dense 
              outlined 
              v-model="mergedReactiveSentence[userId].state.metaJson[meta]" 
              :label="meta"
              />
            <q-input
              class="row"
              dense
              outlined
              v-model="mergedReactiveSentence[userId].state.metaJson.sent_id"
              label="sent_id"
              :rules="[(val) => !sortedSentIds.filter((val) => val !== sentId && val !== mergedSentId ).includes(val) || $t('sentenceSegmentation.sentIdWarningMsg[0]')]"
            />
          </div>
          <div>
            <q-btn
              :disable="sortedSentIds.includes(mergedReactiveSentence[userId].state.metaJson.sent_id as string)"
              outline
              color="primary"
              icon="save"
              :label="$t('sentenceSegmentation.saveResults')"
              @click="saveMergeResults()"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { emptySentenceJson, metaJson_T, sentenceConllToJson, sentenceJsonToConll, sentenceJson_T, treeJson_T } from 'conllup/lib/conll';
import { ReactiveSentence } from 'dependencytreejs/src/ReactiveSentence';
import { mapState, mapWritableState } from 'pinia';
import api from 'src/api/backend-api';
import { useProjectStore } from 'src/pinia/modules/project';
import { useTreesStore } from 'src/pinia/modules/trees';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import VueDepTree from './VueDepTree.vue';

interface sentence_t {
  [key: string]: sentenceJson_T;
}

export default defineComponent({
  name: 'SentenceSegmentation',
  components: {
    VueDepTree,
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
    userId: {
      type: String as PropType<string>,
      required: true,
    },
    sampleName: {
      type: String as PropType<string>,
      required: true,
    },
    segmentationOption: {
      type: String as PropType<'SPLIT' | 'MERGE'>,
      required: true,
    },
  },
  data() {
    const hasPendingChanges: { [key: string]: boolean } = {};
    const firstSentences: sentence_t = {};
    const secondSentences: sentence_t = {};
    const mergedSentences: sentence_t = {};
    const firstReactiveSentence: reactive_sentences_obj_t = {};
    const secondReactiveSentence: reactive_sentences_obj_t = {};
    const mergedReactiveSentence: reactive_sentences_obj_t = {};
    return {
      showDial: true,
      hasPendingChanges,
      sentence: '',
      sentId: '',
      firstSentences,
      secondSentences,
      firstReactiveSentence,
      secondReactiveSentence,
      mergedReactiveSentence,
      mergedSentences,
      showResults: false,
      forceRender: 0,
      mergedSentId: '',
      mergeWarningMessage: '',
      unchangedMetaData: ['sent_id', 'user_id', 'timestamp']
    };
  },
  computed: {
    ...mapState(useTreesStore, ['sortedSentIds', 'filteredTrees', 'trees']),
    ...mapWritableState(useTreesStore, ['reloadTrees']),
    ...mapState(useProjectStore, ['name']),
    disableSaveResultBtn(): boolean {
      const firstSentId = this.firstReactiveSentence[this.userId].state.metaJson.sent_id as string;
      const sencondSentId = this.secondReactiveSentence[this.userId].state.metaJson.sent_id as string;
      return firstSentId === sencondSentId || this.sortedSentIds.includes(firstSentId) || this.sortedSentIds.includes(sencondSentId);
    },
  },
  mounted() {
    this.hasPendingChanges[this.userId] = false;
    this.sentence = this.reactiveSentencesObj[this.userId].state.metaJson.text as string;
    this.sentId = this.reactiveSentencesObj[this.userId].state.metaJson.sent_id as string;
    if (this.segmentationOption !== 'SPLIT' && this.segmentationOption !== 'MERGE') {
      this.MergeSentences();
      this.showReactiveSentences();
    }
    else {
      this.sentenceBus.on('open:splitDialog', ({token}) => {
        this.splitSentence(parseInt(token.ID));
        this.showReactiveSentences();
      })
    }
  },
  methods: {
    closeDialog() {
      this.$emit('closed');
    },
    splitSentence(indexSplit: number) {
      for (const [userId, reactiveSentenceObj] of Object.entries(this.reactiveSentencesObj)) {
        let sentenceTree = reactiveSentenceObj.state.treeJson;
        let sentenceMeta = reactiveSentenceObj.state.metaJson;
        this.firstSentences[userId] = emptySentenceJson();
        this.secondSentences[userId] = emptySentenceJson();
        this.splitSentenceTree(indexSplit, userId, sentenceTree);
        this.splitSentenceMeta(this.firstSentences[userId], 'split1', sentenceMeta);
        this.splitSentenceMeta(this.secondSentences[userId], 'split2', sentenceMeta);
      }
    },
    splitSentenceTree(indexSplit: number, userId: string, sentenceTree: treeJson_T) {
      Object.values(sentenceTree.nodesJson).forEach((token, index) => {
        let id = index + 1;
        if (id < indexSplit) {
          this.firstSentences[userId].treeJson.nodesJson[`${id}`] = { ...token };
          if (token.HEAD >= indexSplit) this.firstSentences[userId].treeJson.nodesJson[`${id}`].HEAD = 0;
        } else {
          let newId = id + 1 - indexSplit;
          let newToken = {
            ...token,
            ID: `${newId}`,
            HEAD: token.HEAD < indexSplit ? (token.HEAD === 0 ? 0 : -1 ) : token.HEAD + 1 - indexSplit,
            DEPREL: token.HEAD < indexSplit  && token.HEAD !== 0 ? '_' : token.DEPREL
          };
          this.secondSentences[userId].treeJson.nodesJson[`${newId}`] = { ...newToken };
        }
      });
    },
    splitSentenceMeta(targetSentence: sentenceJson_T, split: string, sentenceMeta: metaJson_T) {
      for (const [metaKey, metaValue] of Object.entries(sentenceMeta)) {
        if (metaKey == 'text') {
          targetSentence.metaJson[metaKey] = Object.values(targetSentence.treeJson.nodesJson)
            .map((token) => token.FORM)
            .join(' ');
        } else if (metaKey == 'sent_id') {
          targetSentence.metaJson[metaKey] = `${metaValue}_${split}`;
        } else {
          targetSentence.metaJson[metaKey] = metaValue;
        }
      }
    },
    showReactiveSentences() {
      this.forceRender += 1;
      this.showResults = true;
      if (this.segmentationOption === 'SPLIT') {
        this.createReactiveSentence(this.firstSentences, this.firstReactiveSentence as reactive_sentences_obj_t);
        this.createReactiveSentence(this.secondSentences, this.secondReactiveSentence as reactive_sentences_obj_t);
      } else {
        this.createReactiveSentence(this.mergedSentences, this.mergedReactiveSentence as reactive_sentences_obj_t);
        if (this.mergeWarningMessage) {
          notifyMessage({
            message: this.mergeWarningMessage,
            color: 'warning',
            position: 'top',
            timeout: 0,
          });
        }
      }
    },
    createReactiveSentence(targetSentences: sentence_t, reactiveSentencesObj: reactive_sentences_obj_t) {
      for (const userId in targetSentences) {
        const reactiveSentence = new ReactiveSentence();
        reactiveSentence.fromSentenceConll(sentenceJsonToConll(targetSentences[userId]));
        reactiveSentencesObj[userId] = reactiveSentence;
      }
    },
    saveSplitResult() {
      this.updateChangedMetadata(this.firstSentences, this.firstReactiveSentence as reactive_sentences_obj_t);
      this.updateChangedMetadata(this.secondSentences, this.secondReactiveSentence as reactive_sentences_obj_t);
      const firstSentencesJson = this.firstSentences;
      const secondSentencesJson = this.secondSentences;
      const data = {
        sentId: this.sentId,
        firstSents: firstSentencesJson,
        secondSents: secondSentencesJson,
      };
      api
        .splitTree(this.name, this.sampleName, data)
        .then(() => {
          notifyMessage({ message: `sentence '${this.sentId}' is successfully splitted into two sentences` });
          this.reloadTrees = true;
          this.closeDialog();
        })
        .catch(() => {
          notifyError({ error: 'Error while splitting the sentence' });
        });
    },
    updateChangedMetadata(targetSentences: sentence_t, targetReactiveSentence: reactive_sentences_obj_t) {
      for (const sentence of Object.values(targetSentences)) {
        for (const metaKey of Object.keys(targetReactiveSentence[this.userId].state.metaJson).filter((key) => key.includes('text'))) {
          sentence.metaJson[metaKey] = targetReactiveSentence[this.userId].state.metaJson[metaKey];
        }
        sentence.metaJson.sent_id = targetReactiveSentence[this.userId].state.metaJson.sent_id;
      }
    },
    MergeSentences() {
      const usersDiff = [];
      this.mergeWarningMessage = '';
      const secondSentenceConlls = this.trees[this.mergedSentId].conlls;
    
      for (const [userId, reactiveSentence] of Object.entries(this.reactiveSentencesObj)) {
        if (Object.keys(secondSentenceConlls).includes(userId)) {
          const firstSentenceConll = reactiveSentence.exportConll();
          const secondSentenceConll = secondSentenceConlls[userId];
          this.mergedSentences[userId] = this.mergeConlls(firstSentenceConll, secondSentenceConll) ;
        } 
        else {
          usersDiff.push(userId);
          this.mergedSentences[userId] = reactiveSentence.state;
        }
      }
      for (const userId of Object.keys(secondSentenceConlls)) {
        if (!Object.keys(this.reactiveSentencesObj).includes(userId)) {
          usersDiff.push(userId);
          this.mergedSentences[userId] = sentenceConllToJson(secondSentenceConlls[userId]);
        }
      }
      if (usersDiff.length) {
        this.mergeWarningMessage = `Users "${usersDiff.join(', ')}" do not have trees in both sentences, so their trees are merged with empty trees`;
      }
    },
    mergeConlls(firstSentenceConll: string, secondSentenceConll: string) {
      const mergedSentence = emptySentenceJson();
      const firstSentenceJson = sentenceConllToJson(firstSentenceConll);
      const secondSentenceJson = sentenceConllToJson(secondSentenceConll);
      Object.values(firstSentenceJson.treeJson.nodesJson).forEach((token, index) => {
        mergedSentence.treeJson.nodesJson[`${index + 1}`] = { ...token };
      });
      let length = Object.values(mergedSentence.treeJson.nodesJson).length;
      Object.values(secondSentenceJson.treeJson.nodesJson).forEach((token, index) => {
        let newId = index + length + 1;
        mergedSentence.treeJson.nodesJson[`${newId}`] = {
          ...token,
          ID: `${newId}`,
          HEAD: token.HEAD > 0 ? token.HEAD + length : token.HEAD,
        };
      });

      mergedSentence.metaJson = {
        ...firstSentenceJson.metaJson,
        ...secondSentenceJson.metaJson,
        timestamp: firstSentenceJson.metaJson.timestamp > secondSentenceJson.metaJson.timestamp ? firstSentenceJson.metaJson.timestamp: secondSentenceJson.metaJson.timestamp,
        sent_id: this.proposeMergedSentId(firstSentenceJson.metaJson.sent_id as  string, secondSentenceJson.metaJson.sent_id as string),
      };
      
      for (const key of Object.keys(firstSentenceJson.metaJson)) {
        if (Object.keys(secondSentenceJson.metaJson).includes(key) 
          && !this.unchangedMetaData.includes(key) 
          && secondSentenceJson.metaJson[key] !== firstSentenceJson.metaJson[key]
        ) {
         mergedSentence.metaJson[key] = `${firstSentenceJson.metaJson[key]} ${secondSentenceJson.metaJson[key]}`
        } 
      }
      return mergedSentence;
    },
    proposeMergedSentId(firstSentId: string, secondSentId: string) {
      const firstSentIdParts = firstSentId.split('_');
      const secondSentIdParts = secondSentId.split('_');
      const firstSentSuffix = firstSentIdParts.pop();
      const secondSentSuffix = secondSentIdParts.pop();
      if (JSON.stringify(firstSentIdParts) === JSON.stringify(secondSentIdParts)) {
        return firstSentId + '_' + secondSentSuffix;
      } else {
        return firstSentId + '_' + secondSentId;
      }
    },
    saveMergeResults() {
      this.updateChangedMetadata(this.mergedSentences, this.mergedReactiveSentence as reactive_sentences_obj_t);
      const data = {
        firstSentId: this.sentId,
        secondSentId: this.mergedSentId,
        mergedSentences: this.mergedSentences,
      };
      api
        .mergeTrees(this.name, this.sampleName, data)
        .then(() => {
          notifyMessage({
            message: `the sentence '${this.sentId}' and the sentence '${this.mergedSentId}' are successfully merged`,
          });
          this.reloadTrees = true;
          this.closeDialog();
        })
        .catch(() => {
          notifyError({ error: `Error while merging '${this.sentId}' and '${this.mergedSentId}'` });
        });
    },
  },
});
</script>
