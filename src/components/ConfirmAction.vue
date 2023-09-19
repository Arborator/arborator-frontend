<template>
  <q-card>
    <q-bar class="bg-primary text-white">
      <q-space />
      <div class="text-weight-bold">{{ $t('confirmAction.title') }}</div>
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section> {{ $t('confirmAction.message') }}</q-card-section>
    <q-form class="q-gutter-md">
      <q-card-section>
        <q-input
          v-model="name"
          filled
          :label="$t('confirmAction.label')"
          :hint="$t('confirmAction.hint')"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || $t('confirmAction.warning[0]'),
            (val) => val == $props.targetName || $t('confirmAction.warning[1]'),
          ]"
        />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn v-close-popup flat :label="$t('cancel')"></q-btn>
        <q-btn
          v-close-popup
          v-if="$props.targetName != null"
          :label="$t('confirm')"
          type="submit"
          color="primary"
          @keyup.enter="confirm()"
          @click="confirm()"
        />
        <q-btn v-else v-close-popup color="primary" :label="$t('confirm')" @keyup.enter="confirm()" @click="confirm()"></q-btn>
      </q-card-actions>
    </q-form>
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
      required: false,
    },
    targetName: {
      type: String as PropType<string>,
      required: false,
    },
  },
  data() {
    return {
      name: '',
    };
  },
  methods: {
    /**
     * Trigger a parentAction to handle confirm dialog
     *
     * @returns void
     */
    confirm() {
      if (this.$props.targetName != null) {
        if (this.$props.targetName == this.name) this.parentAction(this.arg1, this.name);
      } else {
        this.parentAction(this.arg1);
      }
    },
  },
});
</script>
