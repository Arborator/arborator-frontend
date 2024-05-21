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
  },
  data() {
    return {
      name: '',
    };
  },
  methods: {
    confirm() {
      if (this.targetName == this.name) this.parentAction();
    },
  },
});
</script>
