<template>
  <q-card style="width: 300vh">
    <q-card-section>
      <div class="text-h6">Remove user trees from the selected samples</div>
    </q-card-section>
    <q-card-section class="q-gutter-md">
      <q-select filled v-model="user" label="Select user" :options="getTreesFrom" />
      <div class="row justify-center">
        <q-btn color="primary" @click="triggerConfirm(removeUserTrees)" label="Remove Trees" />
      </div>
    </q-card-section>
  </q-card>
  <q-dialog v-model="confirmActionDial">
    <ConfirmAction :parent-action="confirmActionCallback" :target-name="name" />
  </q-dialog>
</template>
<script lang="ts">
import { mapState } from 'pinia';
import { PropType, defineComponent } from 'vue';

import api from '../../api/backend-api';
import { sample_t } from '../../api/backend-types';
import { useProjectStore } from '../../pinia/modules/project';
import { notifyError, notifyMessage } from '../../utils/notify';
import ConfirmAction from '../shared/ConfirmAction.vue';

export default defineComponent({
  name: 'DeleteUserTreesDial',
  components: { ConfirmAction },
  props: {
    selectedSamples: {
      type: Object as PropType<sample_t[]>,
      required: true,
    },
  },
  data() {
    const confirmActionCallback: CallableFunction = () => {};
    return {
      confirmActionCallback,
      confirmActionDial: false,
      user: '',
    };
  },
  computed: {
    ...mapState(useProjectStore, ['name']),
    getTreesFrom() {
      const treesFrom = this.selectedSamples.map((sample) => sample.treesFrom).reduce((a: string[], b: string[]) => [...a, ...b], []);
      return [...new Set(treesFrom)];
    },
  },
  methods: {
    removeUserTrees() {
      for (const sample of this.selectedSamples) {
        api
          .deleteUserTrees(this.name, sample.sampleName, this.user)
          .then(() => {
            notifyMessage({ message: `${this.user} trees are removed successfully` });
          })
          .catch((error) => {
            notifyError({ error });
          });
      }
    },
    triggerConfirm(method: CallableFunction) {
      this.confirmActionCallback = method;
      this.confirmActionDial = true;
    },
  },
});
</script>
