<template>
  <p>{{ count }}</p>
  <p @click="increment(3)">{{ projects }}</p>
  <BLA />
</template>

<script lang="ts">
import { mapStores, mapActions, mapState } from 'pinia';
import { useCounterStore, useBlaStore } from './to_delete';
import BLA from './to_delete2.vue';

export default {
  components: { BLA },
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
