import { boot } from 'quasar/wrappers';
import Vue3Storage, { StorageType } from 'vue3-storage';

const options = { namespace: 'arboratorgrew__', storage: StorageType.Local };
export default boot(({ app }) => {
  app.use(Vue3Storage, options);
  console.log('Boot vue3-storage');
});
