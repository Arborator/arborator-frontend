import messages from 'src/i18n';
import { createI18n } from 'vue-i18n';

export const i18n = createI18n({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages,
  globalInjection: true,
});

console.log('i18n', i18n);

export default ({ app }) => {
  // Set i18n instance on app
  app.use(i18n);
};
// export default ({ app }) => {
//   // Set i18n instance on app
//   app.i18n = i18n
//   app.
// }

// export { i18n }
