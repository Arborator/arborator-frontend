<template>
  <Error404 v-if="invalidProjectError"></Error404>
  <router-view v-else />
</template>

<script lang="ts">
import Error404 from './pages/Error404.vue';
import { defineComponent } from 'vue';

import { mapState } from 'pinia';
import { useStorage } from 'vue3-storage';

import { useUserStore } from './pinia/modules/user/index';
import { useProjectStore } from './pinia/modules/project/index';

export default defineComponent({
  components: {
    Error404,
  },
  name: 'App',
  data() {
    return {
      storage: useStorage(),
      alerts: {
        welcomeback: {
          color: 'primary',
          message: this.$t('welcomeback'),
          progress: true,
          icon: 'mood',
        },
      },
    };
  },
  computed: {
    ...mapState(useProjectStore, ['invalidProjectError']),
  },
  mounted() {
    const userStore = useUserStore();
    userStore.checkSession().then(() => console.log('App.vue session checked with pinia store'));

    try {
      this.$i18n.locale = this.storage.getStorageSync('arbolang') as string;
    } catch (error) {
      this.$i18n.locale = this.$q.lang.getLocale() as string;
      this.storage.setStorageSync('arbolang', this.$i18n.locale);
    }
  },
});
</script>

<style>
svg[xmlns="http://www.w3.org/2000/svg"]
{
  display: none;
}
</style>
