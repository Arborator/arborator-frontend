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
            <q-btn color="primary" :label="$t('sentenceSegmentation.showResultBtn')" @click="showReactiveSentences()" />
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
                v-model="firstReactiveSentence[userId].state.metaJson.sent_id"
                label="text"
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
                v-model="secondReactiveSentence[userId].state.metaJson.sent_id"
                label="text"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import VueDepTree from './VueDepTree.vue';

import { sentenceJson_T, emptySentenceJson, sentenceJsonToConll } from 'conllup/lib/conll';
import { ReactiveSentence } from 'dependencytreejs/src/ReactiveSentence';
import { sentence_bus_t, reactive_sentences_obj_t } from 'src/types/main_types';
import { defineComponent, PropType } from 'vue';

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
    const firstSentence: sentenceJson_T = emptySentenceJson();
    const secondSentence: sentenceJson_T = emptySentenceJson();
    const firstReactiveSentence: reactive_sentences_obj_t = {};
    const secondReactiveSentence: reactive_sentences_obj_t = {};
    return {
      showDial: true,
      option: 'split',
      hasPendingChanges,
      sentence: '',
      sentId: '',
      token: {},
      firstSentence,
      secondSentence,
      firstReactiveSentence,
      secondReactiveSentence,
      showResults: false,
      forceRender: 0,
    }
  },
  computed: {
    getSentenceForms(): any[] {
      return Object.values(this.reactiveSentencesObj[this.userId].state.treeJson.nodesJson)
        .map((token) => ({ index: parseInt(token.ID), form: token.FORM }));
    },
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
      const sentenceTree = this.reactiveSentencesObj[this.userId].state.treeJson;
      const sentenceMeta = this.reactiveSentencesObj[this.userId].state.metaJson;
      this.firstSentence = emptySentenceJson();
      this.secondSentence = emptySentenceJson();
      Object.values(sentenceTree.nodesJson).forEach((token, index) => {
        let id = index + 1;
        if (id < indexSplit) {
          this.firstSentence.treeJson.nodesJson[`${id}`] = { ...token };
          if (token.HEAD >= indexSplit) this.firstSentence.treeJson.nodesJson[`${id}`].HEAD = 0;
        }
        else {
          let newId = id + 1 - indexSplit;
          this.secondSentence.treeJson.nodesJson[`${newId}`] = { ...token };
          this.secondSentence.treeJson.nodesJson[`${newId}`].ID = `${newId}`;
          if (token.HEAD < indexSplit) {
            this.secondSentence.treeJson.nodesJson[`${newId}`].HEAD = 0;
          }
          else {
            this.secondSentence.treeJson.nodesJson[`${newId}`].HEAD = token.HEAD + 1 - indexSplit;
          }
        }
      });

      for (const [metaKey, metaValue] of Object.entries(sentenceMeta)) {
        if (metaKey == 'text') {
          this.firstSentence.metaJson[metaKey] = Object.values(this.firstSentence.treeJson.nodesJson).map(token => token.FORM).join(' ');
          this.secondSentence.metaJson[metaKey] = Object.values(this.secondSentence.treeJson.nodesJson).map(token => token.FORM).join(' ');
        } else if (metaKey == 'timestamp') {
          this.firstSentence.metaJson[metaKey] = String(Date.now()*1000);
          this.secondSentence.metaJson[metaKey] = String(Date.now()*1000);
        } else if (metaKey == 'sent_id') {
          this.firstSentence.metaJson[metaKey] = `${metaValue}_split1`;
          this.secondSentence.metaJson[metaKey] = `${metaValue}_split2`
        }
        else {
          this.firstSentence.metaJson[metaKey] = metaValue;
          this.secondSentence.metaJson[metaKey] = metaValue;
        }

      }
    },
    showReactiveSentences() {
      this.forceRender += 1;
      this.showResults = true;
      const firstReactiveSentence = new ReactiveSentence();
      const secondReactiveSentence = new ReactiveSentence();
      firstReactiveSentence.fromSentenceConll(sentenceJsonToConll(this.firstSentence) as string);
      secondReactiveSentence.fromSentenceConll(sentenceJsonToConll(this.secondSentence) as string);
      this.firstReactiveSentence[this.userId] = firstReactiveSentence;
      this.secondReactiveSentence[this.userId] = secondReactiveSentence;
    }
  }

});

</script>