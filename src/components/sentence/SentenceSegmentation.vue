<template>
  <q-dialog v-model="showDial">
    <q-card style="min-width: 100%" class="custom-frame1">
      <q-bar class="bg-primary text-white sticky-bar">
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="row">
          <div class="col text-h6">
            Sentence segmentation
          </div>
          <div class="col">
            <q-select
              dense
              outlined
              v-model="option"
              label="Select option"
              :options="['merge', 'divide']"
            >
            </q-select>
          </div>
        </div>
      </q-card-section>
      <q-card-section v-if="option === 'divide'">
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

      </q-card-section>
      <q-card-section v-else>

      </q-card-section>

    </q-card>

  </q-dialog>
</template>
<script lang="ts">

import VueDepTree from './VueDepTree.vue';
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
    return {
      showDial: true,
      option: 'divide',
      hasPendingChanges,
      sentence: '',
      sentId: ''
    }
  },
  mounted() {
    this.hasPendingChanges[this.userId] = false;
    this.sentence = this.reactiveSentencesObj[this.userId].state.metaJson.text as string;
    this.sentId = this.reactiveSentencesObj[this.userId].state.metaJson.sent_id as string;
  },

   

});

</script>