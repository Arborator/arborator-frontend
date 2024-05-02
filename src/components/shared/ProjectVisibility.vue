<template>
  <q-chip outline color="primary" size="sm" v-show="visibility === 0" label="Private"></q-chip>
  <q-chip outline color="primary" size="sm" v-show="visibility === 1" label="Open"></q-chip>
  <q-chip outline color="primary" size="sm" v-show="visibility === 2" label="Public"></q-chip>
  <q-chip outline color="primary" size="sm" v-show="blindAnnotationMode" label="Blind annotation"></q-chip>
</template>

<script>
export default {
  name: 'ProjectIcon',
  props: {
    visibility: {
      type: Number,
      required: true,
    },
    blindAnnotationMode: {
      type: Boolean,
      required: true,
    },
  },
};
</script>
