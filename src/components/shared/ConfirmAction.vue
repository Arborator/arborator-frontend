<template>
  <q-card>
    <q-bar class="bg-primary text-white">
      <q-space />
      <div class="text-weight-bold">{{ dialogTitle }}</div>
      <q-space />
      <q-btn v-close-popup flat dense icon="close" />
    </q-bar>
    <q-card-section v-if="dialogMessage"> {{ dialogMessage }}</q-card-section>
    <q-form class="q-gutter-md">
      <q-card-section v-if="warningMessage" class="q-pa-md bg-orange-1 text-orange-10">
        <q-icon name="warning" class="q-mr-md" />
        {{ warningMessage }}
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="name"
          filled
          :label="dialogLabel"
          :hint="dialogHint"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || $t('confirmAction.warning[0]'), (val) => val == targetName || $t('confirmAction.warning[1]')]"
        />
      </q-card-section>
      <q-card-actions align="around">
        <q-btn v-close-popup flat :label="$t('cancel')"></q-btn>
        <q-btn v-close-popup :label="$t('confirm')" type="submit" color="primary" @keyup.enter="confirm()" @click="confirm()" />
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
    targetName: {
      type: String as PropType<string>,
      required: false,
    },
    title: {
      type: String as PropType<string>,
      required: false,
      default: '',
    },
    message: {
      type: String as PropType<string>,
      required: false,
      default: '',
    },
    hint: {
      type: String as PropType<string>,
      required: false,
      default: '',
    },
    label: {
      type: String as PropType<string>,
      required: false,
      default: '',
    },
    warningMessage: {
      type: String as PropType<string>,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      name: '',
    };
  },
  computed: {
    dialogTitle() {
      return this.title || this.$t('confirmAction.title');
    },
    dialogMessage() {
      if (this.warningMessage && !this.message) {
        return '';
      }

      return this.message || this.$t('confirmAction.message');
    },
    dialogHint() {
      return this.hint || this.$t('confirmAction.hint');
    },
    dialogLabel() {
      return this.label || this.$t('confirmAction.label');
    },
  },
  methods: {
    confirm() {
      if (this.targetName == this.name) this.parentAction();
    },
  },
});
</script>
