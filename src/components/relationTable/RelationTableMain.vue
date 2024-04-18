<template>
  <div>
    <q-page-sticky :position="breakpoint ? 'bottom-right' : 'bottom-right'" :offset="breakpoint ? [18, 88] : [30, 10]" style="z-index: 999">
      <q-btn size="20px" round color="primary text-green" icon="ion-md-grid" @click="relationTableDial = !relationTableDial">
        <q-tooltip anchor="center left" content-class="bg-primary" content-style="font-size: 16px">
          {{ $t('projectView.tooltipRelationTable') }}
        </q-tooltip>
      </q-btn>
    </q-page-sticky>

    <q-dialog v-model="relationTableDial" transition-show="fade" transition-hide="fade">
      <RelationTable :sample-names="sampleNames" :trees-from="treesFrom"></RelationTable>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import RelationTable from './RelationTable.vue';

import { defineComponent, PropType } from 'vue';

export default defineComponent({
  components: {
    RelationTable,
  },
  props: {
    sampleNames: {
      type: Object as PropType<string[]>,
      default: [],
    },
    treesFrom: {
      type: Object as PropType<string[]>,
      default: [],
    }
  },
  data() {
    return {
      relationTableDial: false,
      window: { width: 0, height: 0 },
    };
  },

  computed: {
    breakpoint(): boolean {
      return this.window.width <= 400;
    },
  },
});
</script>
