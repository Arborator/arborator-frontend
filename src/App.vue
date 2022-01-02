<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useStorage } from 'vue3-storage';
import { useUserStore } from './pinia/modules/user/index';

export default defineComponent({
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
  mounted() {
    const userStore = useUserStore();
    userStore.checkSession().then(() => console.log('App.vue session checked with pinia store'));
    // this.$store.dispatch('user/checkSession', {}).then(() => {
    //   console.log('App.vue Session checked');
    // });
    try {
      this.$q.dark.set(this.storage.getStorageSync('dm') as boolean | 'auto');
    } catch (error) {
      console.log('App.vue ls not found');
    }
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
