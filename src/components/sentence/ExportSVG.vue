<template>
  <div></div>
</template>

<script lang="ts">
import { exportPNG, exportSVG } from 'dependencytreejs/src/exportHandler';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

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
