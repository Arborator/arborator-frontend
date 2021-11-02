<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";

import Store from "./store/index";
import { useStorage } from "vue3-storage";

export default defineComponent({
  name: "App",
  data() {
    return {
      store: Store,
      storage: null,
      alerts: {
        welcomeback: {
          color: "primary",
          message: this.$t("welcomeback"),
          progress: true,
          icon: "mood",
        },
      },
    };
  },
  mounted() {
    console.log();
    this.storage = useStorage();
    this.$store.dispatch("user/checkSession", {}).then(() => {
      this.$router.push("/");
    });
    try {
      this.$q.dark.set(this.storage.getStorageSync("dm"));
    } catch (error) {
      console.log("ls not found");
    }
    try {
      this.$i18n.locale = this.storage.getStorageSync("arbolang");
    } catch (error) {
      this.$i18n.locale = this.$q.lang.getLocale();
      this.storage.setStorageSync("arbolang", this.$i18n.locale);
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
