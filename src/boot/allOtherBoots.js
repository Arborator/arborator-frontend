import { boot } from 'quasar/wrappers'
import Vue3Storage from "vue3-storage";
import { i18n } from "../i18n/index";


var options = { namespace: "arboratorgrew__", name: "ls", storage: "local" };
export default boot(({ app }) => {
  app.use(Vue3Storage, options);
  app.use(i18n)
})