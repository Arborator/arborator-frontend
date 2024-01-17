<template>
  <q-dialog v-model="showDial" maximized>
    <q-card style="min-width: 100%" class="custom-frame1">
      <q-bar class="bg-primary text-white sticky-bar">
        <q-space />
        <q-btn v-close-popup flat dense icon="close" @click="closeDialog" />
      </q-bar>

      <q-card-section class="row">
        <div class="col text-h6">
            {{ $t('sentenceSegmentation.title') }}
        </div>
        <div class="col">
          <q-select 
            dense 
            outlined 
            v-model="option" 
            label="Select option" 
            :options="['split', 'merge']"
          >
          </q-select>
        </div>
      </q-card-section>

      <!-- split sentences -->
      <q-card-section v-if="option === 'split'">
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
            >
          </VueDepTree>
        </div>
        <div class="row q-py-md q-gutter-md">
          <div class="col">
            <q-select 
              dense 
              outlined 
              v-model="token" 
              option-label="form" 
              :label="$t('sentenceSegmentation.selectSplitLabel')"
              :options="getSentenceForms"
              @update:model-value="splitSentence(token.index)"
            >
              <template v-slot:selected-item="scope">
                {{ scope.opt.form }}
              </template>
            </q-select>
          </div>
          <div class="col">
            <q-btn :disable="token.form == ''" flat color="primary" :label="$t('sentenceSegmentation.showResultBtn')" @click="showReactiveSentences()" />
          </div>
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
                dense
                outlined
                v-model="firstReactiveSentence[userId].state.metaJson.text"
                label="text"
              />
              <q-input
                dense
                outlined
                v-model="firstReactiveSentence[userId].state.metaJson.text_en"
                label="text_en"
              />
              <q-input
                dense
                outlined
                v-model="firstReactiveSentence[userId].state.metaJson.sent_id"
                label="sent_id"
                :rules="[
                  (val) => !sortedSentIds.includes(val) || $t('sentenceSegmentation.sentIdWarningMsg[0]'),
                  (val) => val !== secondReactiveSentence[userId].state.metaJson.sent_id || $t('sentenceSegmentation.sentIdWarningMsg[1]') 
                ]"
              />
            </div>
            <div class="col q-gutter-sm">
              <q-input
                dense
                outlined
                v-model="secondReactiveSentence[userId].state.metaJson.text"
                label="text"
              />
              <q-input
                dense
                outlined
                v-model="secondReactiveSentence[userId].state.metaJson.text_en"
                label="text_en"
              />
              <q-input
                dense
                outlined
                v-model="secondReactiveSentence[userId].state.metaJson.sent_id"
                label="sent_id"
                :rules="[
                  (val) => !sortedSentIds.includes(val) || $t('sentenceSegmentation.sentIdWarningMsg[0]'),
                  (val) => val !== firstReactiveSentence[userId].state.metaJson.sent_id || $t('sentenceSegmentation.sentIdWarningMsg[2]') 
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
        <div class="row q-py-md q-gutter-md">
          <div class="col">
            <q-select 
              dense 
              outlined 
              v-model="mergedSentId"
              :label="$t('sentenceSegmentation.selectMergeLabel')"
              :options="sortedSentIds"
              @update:model-value="MergeSentences()"
            >
            </q-select>
          </div>
          <div class="col">
            <q-btn :disable="mergedSentId == ''" flat color="primary" :label="$t('sentenceSegmentation.showResultBtn')" @click="showReactiveSentences()" />
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
              >
            </VueDepTree>
          </div>
           <div class="q-gutter-md q-py-md">
            <q-input
              class="row"
              dense
              outlined
              v-model="mergedReactiveSentence[userId].state.metaJson.text"
              label="text"
            />
            <q-input
              class="row"
              dense
              outlined
              v-model="mergedReactiveSentence[userId].state.metaJson.text_en"
              label="text_en"
            />
            <q-input
              class="row"
              dense
              outlined
              v-model="mergedReactiveSentence[userId].state.metaJson.sent_id"
              label="sent_id"
              :rules="[
                (val) => !sortedSentIds.includes(val) || $t('sentenceSegmentation.sentIdWarningMsg[0]'),
              ]"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import VueDepTree from './VueDepTree.vue';
import api from 'src/api/backend-api';

import { emptySentenceJson, sentenceConllToJson, sentenceJsonToConll, sentenceJson_T, treeJson_T, metaJson_T } from 'conllup/lib/conll';
import { ReactiveSentence } from 'dependencytreejs/src/ReactiveSentence';
import { mapState } from 'pinia';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { useTreesStore } from 'src/pinia/modules/trees';
import { useProjectStore } from 'src/pinia/modules/project';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { PropType, defineComponent } from 'vue'

interface sentence_t {
  [key: string]: sentenceJson_T
}

export default defineComponent({
  name: "SentenceSegmentation",
  components: {
    VueDepTree,
  },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true
    },
    reactiveSentencesObj: {
      type: Object as PropType<reactive_sentences_obj_t>,
      required: true,
    },
    userId: {
      type: String as PropType<string>,
      required: true
    }
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
      option: 'merge',
      hasPendingChanges,
      sentence: '',
      sentId: '',
      token: {},
      firstSentences,
      secondSentences,
      firstReactiveSentence,
      secondReactiveSentence,
      mergedReactiveSentence,
      mergedSentences, 
      showResults: false,
      forceRender: 0,
      mergedSentId: '',
    }
  },
  computed: {
    ...mapState(useTreesStore, ['sortedSentIds', 'filteredTrees']),
    ...mapState(useProjectStore, ['name']),
    getSentenceForms(): any[] {
      return Object.values(this.reactiveSentencesObj[this.userId].state.treeJson.nodesJson)
        .map((token) => ({ index: parseInt(token.ID), form: token.FORM }));
    },
    disableSaveResultBtn(): boolean {
      const firstSentId = this.firstReactiveSentence[this.userId].state.metaJson.sent_id as string;
      const sencondSentId = this.secondReactiveSentence[this.userId].state.metaJson.sent_id as string;
      return firstSentId === sencondSentId || this.sortedSentIds.includes(firstSentId) || this.sortedSentIds.includes(sencondSentId);
    }
  },
  mounted() {
    this.hasPendingChanges[this.userId] = false;
    this.sentence = this.reactiveSentencesObj[this.userId].state.metaJson.text as string;
    this.sentId = this.reactiveSentencesObj[this.userId].state.metaJson.sent_id as string;
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
        this.updateSentenceMeta(this.firstSentences[userId], 'split1', sentenceMeta);
        this.updateSentenceMeta(this.secondSentences[userId], 'split2', sentenceMeta); 
      } 
    },
    splitSentenceTree(indexSplit: number, userId: string, sentenceTree: treeJson_T) {
      Object.values(sentenceTree.nodesJson).forEach((token, index) => {
        let id = index + 1;
        if (id < indexSplit) {
          this.firstSentences[userId].treeJson.nodesJson[`${id}`] = { ...token };
          if (token.HEAD >= indexSplit) this.firstSentences[userId].treeJson.nodesJson[`${id}`].HEAD = 0;
        }
        else {
          let newId = id + 1 - indexSplit;
          let newToken = {
            ...token, 
            ID: `${newId}`,
            HEAD: token.HEAD < indexSplit ? 0 : token.HEAD + 1 - indexSplit
          }
          this.secondSentences[userId].treeJson.nodesJson[`${newId}`] = { ...newToken };
        }
      });
    },
    updateSentenceMeta(targetSentence: sentenceJson_T, split: string, sentenceMeta: metaJson_T) {
      for (const [metaKey, metaValue] of Object.entries(sentenceMeta)) {
        if (metaKey == 'text') {
          targetSentence.metaJson[metaKey] = Object.values(targetSentence.treeJson.nodesJson).map(token => token.FORM).join(' ');
        } else if (metaKey == 'timestamp') {
          targetSentence.metaJson[metaKey] = String(Date.now()*1000);
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
      if (this.option === 'split') {
        this.createReactiveSentence(this.firstSentences, this.firstReactiveSentence as reactive_sentences_obj_t);
        this.createReactiveSentence(this.secondSentences, this.secondReactiveSentence as reactive_sentences_obj_t);
      } else {
        this.createReactiveSentence(this.mergedSentences, this.mergedReactiveSentence as reactive_sentences_obj_t);
      }
      
    }, 
    createReactiveSentence(targetSentences: sentence_t, reactiveSentencesObj: reactive_sentences_obj_t) {
      for (const userId in targetSentences) {
        const reactiveSentence = new ReactiveSentence();
        reactiveSentence.fromSentenceConll(sentenceJsonToConll(targetSentences[userId]) as string);
        reactiveSentencesObj[userId] = reactiveSentence;
      }
    },
    saveSplitResult() {
      this.updateChangedMetadata(this.firstSentences, this.firstReactiveSentence as reactive_sentences_obj_t);
      this.updateChangedMetadata(this.secondSentences, this.secondReactiveSentence as reactive_sentences_obj_t);
      const firstSentencesJson = this.firstSentences;
      const secondSentencesJson = this.secondSentences;
      const sampleName = this.$route.params.samplename as string;
      const data = {
        sentId: this.sentId,
        firstSents: firstSentencesJson,
        secondSents: secondSentencesJson,
      };
      api
        .splitTree(this.name, sampleName, data)
        .then(() => {
          notifyMessage({ message: `sentence '${this.sentId}' is successfully splitted into two sentences`});
          this.closeDialog();
        })
        .catch(() => {
          notifyError({ error: 'Error while splitting the sentence'});
        }) 
    },
    updateChangedMetadata(targetSentences: sentence_t, targetReactiveSentence: reactive_sentences_obj_t) {
      for (const sentence of Object.values(targetSentences)) {
        sentence.metaJson.text = targetReactiveSentence[this.userId].state.metaJson.text;
        sentence.metaJson.sent_id = targetReactiveSentence[this.userId].state.metaJson.sent_id;
        sentence.metaJson.text_en = targetReactiveSentence[this.userId].state.metaJson.text_en; 
      }
    },
    MergeSentences() {
      const secondSentenceConlls = this.filteredTrees[this.sortedSentIds.indexOf(this.mergedSentId)].conlls
      for (const [userId, reactiveSentence] of Object.entries(this.reactiveSentencesObj)) {
        if (Object.keys(secondSentenceConlls).includes(userId)) {
          this.mergedSentences[userId] = emptySentenceJson();
          const secondSentenceJson = sentenceConllToJson(secondSentenceConlls[userId]);

          const sentenceTree = reactiveSentence.state.treeJson;
          const sentenceMeta = reactiveSentence.state.metaJson;
          Object.values(sentenceTree.nodesJson).forEach((token, index) => {
            this.mergedSentences[userId].treeJson.nodesJson[`${index + 1}`] = { ...token };
          });

          let secondSentenceTree = secondSentenceJson.treeJson;
          let secondSentenceMeta = secondSentenceJson.metaJson;
          let length = Object.values(this.mergedSentences[userId].treeJson.nodesJson).length;
          Object.values(secondSentenceTree.nodesJson).forEach((token, index) => {
            let newId = index + length + 1;
            this.mergedSentences[userId].treeJson.nodesJson[`${newId}`] = {
              ...token,
              ID: `${newId}`,
              HEAD: token.HEAD > 0 ? token.HEAD+ length : 0,
            };
          });

          this.mergedSentences[userId].metaJson = {
            ...sentenceMeta, 
            ...secondSentenceMeta, 
            text: sentenceMeta.text + ' ' + secondSentenceMeta.text,
            timestamp: String(Date.now()*1000), 
            sent_id: sentenceMeta.sent_id + '_' + secondSentenceMeta.sent_id,
          }
        }
      }
    }
  }

});

</script>