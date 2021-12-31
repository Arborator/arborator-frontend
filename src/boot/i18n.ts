import messages from 'src/i18n';
import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n'; /// dist/vue-i18n.esm-bundler.js";

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  fallbackWarn: false,
  missingWarn: false,
  // fallbackLocale: {
  //   'en-US': ['en-US'],
  // },
  messages,
  globalInjection: true,
});

export default boot(({ app }) => {
  app.use(i18n);
});
