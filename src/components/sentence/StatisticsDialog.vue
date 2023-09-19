<template>
  <!-------------------- Start uposDialog -------------------->
  <q-dialog v-model="statisticsDialogOpened">
    <!-- @hide="ondialoghide()" -->
    <!-- :maximized="maximizedToggle" -->
    <q-card style="height: 300px">
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">{{ $t('sentenceCard.statisticDial') }} "{{ userId }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section style="height: 200px">
        <div>
          <p v-for="(tag, index) in tagSet" :key="index">
            {{ tag }} correct : {{ corrects[tag] }}/{{ totals[tag] }} ({{ (100 * corrects[tag]) / totals[tag] }}%)
          </p>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn id="catselectvalidate" v-close-popup color="primary" label="Close" style="width: 30%; margin-left: auto; margin-right: auto" />
        <!-- :disabled="snap.currentcategory === snap.category" -->
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!----------------- End uposDialog ------------------->
</template>

<script lang="ts">
import { PropType } from 'vue';
import { sentence_bus_t } from 'src/types/main_types';

type tag_t = 'UPOS' | 'DEPREL' | 'HEAD';
type scores_on_tags_t = { [key in tag_t]: number };
interface stats_t {
  corrects: scores_on_tags_t;
  totals: scores_on_tags_t;
}

import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    conlls: {
      type: Object as PropType<{ teacher: string }>,
      required: true,
    },
  },
  data() {
    const tagSet: tag_t[] = ['UPOS', 'HEAD', 'DEPREL'];
    const corrects: scores_on_tags_t = { UPOS: 0, DEPREL: 0, HEAD: 0 };
    const totals: scores_on_tags_t = { UPOS: 0, DEPREL: 0, HEAD: 0 };
    return {
      tagSet,
      statisticsDialogOpened: false,
      userId: '',
      corrects,
      totals,
    };
  },
  mounted() {
    this.sentenceBus.on('open:statisticsDialog', ({ userId }) => {
      this.userId = userId;
      const stats = this.sentenceBus.sentenceSVGs[this.userId].getDiffStats(this.conlls.teacher) as stats_t;

      this.corrects = stats.corrects;
      this.totals = stats.totals;

      this.statisticsDialogOpened = true;
    });
  },
  beforeUnmount() {
    this.sentenceBus.off('open:statisticsDialog');
  },
});
</script>
<style></style>
