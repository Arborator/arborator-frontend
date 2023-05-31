<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useStorage } from 'vue3-storage';
import { useUserStore } from './pinia/modules/user/index';
import { setThemeMode } from 'dependencytreejs/src/StylesheetHandler';

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
  watch: {
    '$q.dark.isActive'(isActive: boolean) {
      console.log("KK isActive", isActive)
      if (isActive) {
        setThemeMode('DARK', true);
      } else {
        setThemeMode('LIGHT', true);
      }
    },
  },
  mounted() {
    const userStore = useUserStore();
    userStore.checkSession().then(() => console.log('App.vue session checked with pinia store'));

    // init dependencytreejs mode to light
    setThemeMode('LIGHT', true);

    // fetched local storage version of the darkmode ('dm')
    const darkIsActiveLocalStorage = this.storage.getStorageSync('dm') as boolean | 'auto' | undefined;
    console.log("KK darkIsActiveLocalStorage", darkIsActiveLocalStorage)
    // set to dark if dm was set in local storage
    if (darkIsActiveLocalStorage !== undefined) {
      this.$q.dark.set(darkIsActiveLocalStorage);
      setThemeMode('DARK', true);
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
