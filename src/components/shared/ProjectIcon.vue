<template>
  <q-icon v-show="visibility === 0" name="lock" :color="$q.dark.isActive ? 'red-6' : 'red-14'" size="lg"></q-icon>
  <q-icon v-show="visibility === 1" name="visibility" :color="$q.dark.isActive ? 'yellow-5' : 'yellow-8'" size="lg"></q-icon>
  <q-icon v-show="visibility === 2" name="groups" :color="$q.dark.isActive ? 'light-green-12' : 'positive'" size="lg"></q-icon>
  <q-icon v-show="exerciseMode" name="school" color="indigo-11" size="lg"></q-icon>
</template>

<script>
export default {
  name: 'ProjectIcon',
  props: {
    visibility: {
      type: Number,
      required: true,
    },
    exerciseMode: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped></style>
