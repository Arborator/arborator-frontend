<template>
  <div></div>
</template>

<script lang="ts">
import { notifyMessage } from 'src/utils/notify';
import { defineComponent, PropType } from 'vue';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { exportSVG, exportPNG } from 'dependencytreejs/src/exportHandler';

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
    return {
      userId: '',
      tab: '',
    };
  },
  mounted() {
    this.sentenceBus.on('export:SVG', ({ userId }: { userId: string }) => {
      this.userId = userId;
      this.getSVG();
    });
    this.sentenceBus.on('export:PNG', ({ userId }: { userId: string }) => {
      this.userId = userId;
      this.getPNG();
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('export:SVG');
    this.sentenceBus.off('export:PNG');
  },
  methods: {
    /**
     * Get the SVG by creating it using snap arborator plugin and then replacing the placeholder in the current DOM
     *
     * @returns void
     */
    getSVG() {
      const sentenceSVG = this.sentenceBus.sentenceSVGs[this.userId];
      const title = `${this.reactiveSentencesObj[this.userId].getUndescoredText()}.${this.userId}.svg`;
      exportSVG(sentenceSVG, title);
      notifyMessage({ message: 'Files downloaded' });
    },
    getPNG() {
      const sentenceSVG = this.sentenceBus.sentenceSVGs[this.userId];
      const title = `${this.reactiveSentencesObj[this.userId].getUndescoredText()}.${this.userId}.png`;
      exportPNG(sentenceSVG, title);
      notifyMessage({ message: 'Files downloaded' });
    },
  },
});
</script>
<style></style>
