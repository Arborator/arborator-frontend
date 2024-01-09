<template>
  <PosDialog :sentence-bus="sentenceBus" :title="'UPOS'" :pos-options="annotationFeatures.UPOS" :event-name="'open:uposDialog'" />
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { sentence_bus_t } from 'src/types/main_types';

import { PropType, defineComponent } from 'vue';
import PosDialog from './PosDialog.vue';

export default defineComponent({
  name: 'UposDialog',
  components: {
    PosDialog,
  },
  props: {
    sentenceBus: {
      type: Object as PropType<sentence_bus_t>,
      required: true,
    },
  },
  computed: {
    ...mapState(useProjectStore, ['annotationFeatures']),
  },
});
</script>
<style></style>
