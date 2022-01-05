<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width: 30vw; max-width: 150px" />
    </p>
    <p class="text-faded">{{ $t('error404page') }}<strong>(404)</strong></p>
    <q-btn color="secondary" style="width: 200px" @click="$router.push('/')">Go back</q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Error404',
});
</script>
