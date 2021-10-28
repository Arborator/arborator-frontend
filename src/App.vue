<template>
  <div>
    <router-view />
  </div>
</template>

<script>
import { createApp, defineComponent } from "vue";

import { openURL } from "quasar";
import VueCookies from "vue3-cookies";
import Store from "./store/index";
// VueCookies.config("7d");
// import Storage from "vue-ls";
import Vue3Storage, { useStorage } from "vue3-storage";
import { i18n } from "./i18n/index";

var options = { namespace: "arboratorgrew__", name: "ls", storage: "local" };

export default defineComponent({
  setup() {
    console.log("KK Setup");
  },
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
    this.$store.dispatch("user/checkSession");
    this.storage = useStorage();

    // this.store.dispatch("checkSession", {});
    // .then(() => {
    //   this.$router.push('/');
    // })
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
  methods: {
    parseJwt: function (token) {
      var base64Url = token.split(".")[1];
      var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      var jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    },
    showNotif(position, alert) {
      const {
        color,
        textColor,
        multiLine,
        icon,
        message,
        avatar,
        actions,
        progress,
      } = this.alerts[alert];
      const buttonColor = color ? "white" : void 0;
      this.$q.notify({
        color,
        textColor,
        icon: icon,
        message,
        position,
        avatar,
        multiLine,
        actions: actions,
        progress: progress,
        timeout: 2000,
      });
    },
  },
});
</script>

<style>
svg[xmlns="http://www.w3.org/2000/svg"]
{
  display: none;
}
</style>
