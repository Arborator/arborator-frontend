// src/boot/pinia
import { boot } from 'quasar/wrappers';
import { createPinia } from 'pinia';

const pinia = createPinia();

export default boot(async ({ app }) => {
  app.use(pinia);
});

export { pinia };
