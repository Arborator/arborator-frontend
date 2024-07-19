<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width: 30vw; max-width: 150px" />
    </p>
    <p class="text-faded">{{ $t('error404page') }}<strong>(404)</strong></p>
    <q-btn color="secondary" style="width: 200px" @click="goBack()">Go back To projects page</q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';

export default defineComponent({
  name: 'Error404',
  computed: {
    ...mapWritableState(useProjectStore, ['invalidProjectError']),
  },
  methods: {
    goBack() {
      this.invalidProjectError = false;
      this.$router.push('/projects');
    }
  }
});
</script>
