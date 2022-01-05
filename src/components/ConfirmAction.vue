<template>
  <q-card>
    <q-bar class="bg-primary text-white">
      <q-space />
      <div class="text-weight-bold">Are you sure?</div>
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section> You are about to perform an irrevocable action. Do you really want to proceed? </q-card-section>
    <q-card-actions align="around">
      <q-btn v-close-popup flat label="Cancel"></q-btn>
      <q-btn v-close-popup color="primary" label="Confirm" @keyup.enter="confirm()" @click="confirm()"></q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
export default defineComponent({
  name: 'ConfirmAction',
  props: {
    parentAction: {
      type: Function as PropType<CallableFunction>,
      required: true,
    },
    arg1: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    /**
     * Trigger a parentAction to handle confirm dialog
     *
     * @returns void
     */
    confirm() {
      this.parentAction(this.arg1);
    },
  },
});
</script>
