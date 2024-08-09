import { boot } from 'quasar/wrappers';
import messages from 'src/i18n';
import { createI18n } from 'vue-i18n';


export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  fallbackWarn: false,
  missingWarn: false,
  messages,
  globalInjection: true,
});

export default boot(({ app }) => {
  app.use(i18n);
});
