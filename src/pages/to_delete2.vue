<template>
  <p>CHILD</p>
  <p>{{ count }}</p>
  <p @click="increment(3)">{{ projects }}</p>
</template>

<script lang="ts">
import { mapStores, mapActions, mapState } from 'pinia';
import { useCounterStore, useBlaStore } from './to_delete';

export default {
  name: 'BLA',
  data() {
    return {
      projects: [],
    };
  },
  computed: {
    // other computed properties
    // ...
    // gives access to this.counterStore and this.userStore
    ...mapStores(useCounterStore, useBlaStore),
    // gives read access to this.count and this.double
    ...mapState(useCounterStore, ['count', 'double']),
  },
  methods: {
    // gives access to this.increment()
    ...mapActions(useCounterStore, ['increment']),
    test() {
      console.log('THIS IS A TEST');
      this.increment(3);
    },
  },
};
</script>

<style></style>
