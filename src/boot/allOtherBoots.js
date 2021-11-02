import { boot } from 'quasar/wrappers'
import Vue3Storage from "vue3-storage";


var options = { namespace: "arboratorgrew__", name: "ls", storage: "local" };
export default boot(({ app }) => {
  app.use(Vue3Storage, options);
  console.log("Boot vue3-storage")
})