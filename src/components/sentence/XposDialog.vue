<template>
  <PosDialog :sentence-bus="sentenceBus" :title="'XPOS'" :pos-options="xposOptions" :event-name="'open:xposDialog'" />
</template>

<script lang="ts">
import { sentence_bus_t } from 'src/types/main_types';
import { PropType, defineComponent } from 'vue';

import PosDialog from './PosDialog.vue';

export default defineComponent({
  name: 'XposDialog',
  components: {
    PosDialog,
  },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
    xposOptions: {
      type: Object as PropType<string[]>,
      required: true,
    }
  },
});
</script>

