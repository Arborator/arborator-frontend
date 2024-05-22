<template>
  <q-dialog v-model="statisticsDialogOpened">
    <q-card>
      <q-bar class="bg-primary text-white">
        <div class="text-weight-bold">{{ $t('sentenceCard.statisticDial') }} "{{ userId }}"</div>
        <q-space />
        <q-btn v-close-popup flat dense icon="close" />
      </q-bar>
      <q-card-section style="height: 200px">
        <q-list bordered separator v-for="tag in tagSet">
          <q-item>
            <q-item-section>{{ tag }} correct :</q-item-section>
            <q-item-section>{{ corrects[tag] }}/{{ totals[tag] }} ({{ (100 * corrects[tag]) / totals[tag] }}%)</q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn v-close-popup color="primary" :label="$t('close')" style="width: 30%; margin-left: auto; margin-right: auto" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { sentence_bus_t } from 'src/types/main_types';
import { PropType } from 'vue';
import { defineComponent } from 'vue';

type tag_t = 'UPOS' | 'DEPREL' | 'HEAD';
type scores_on_tags_t = { [key in tag_t]: number };
interface stats_t {
  corrects: scores_on_tags_t;
  totals: scores_on_tags_t;
}

export default defineComponent({
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    conlls: {
      type: Object as PropType<{ validated: string }>,
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
      const stats = this.sentenceBus.sentenceSVGs[this.userId].getDiffStats(this.conlls.validated) as stats_t;
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
