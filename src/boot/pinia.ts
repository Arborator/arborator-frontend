// src/boot/pinia
import { createPinia } from 'pinia';
import { boot } from 'quasar/wrappers';

const pinia = createPinia();

export default boot(async ({ app }) => {
  app.use(pinia);
});

export { pinia };
