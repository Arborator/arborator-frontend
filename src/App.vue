<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue';

import { useStorage } from 'vue3-storage';
import Store from './store/index';

export default defineComponent({
  name: 'App',
  data() {
    return {
      store: Store,
      storage: null,
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
    this.storage = useStorage();
    this.$store.dispatch('user/checkSession', {}).then(() => {
      console.log('App.vue Session checked');
    });
    try {
      this.$q.dark.set(this.storage.getStorageSync('dm'));
    } catch (error) {
      console.log('App.vue ls not found');
    }
    try {
      this.$i18n.locale = this.storage.getStorageSync('arbolang');
    } catch (error) {
      this.$i18n.locale = this.$q.lang.getLocale();
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
