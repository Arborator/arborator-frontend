import messages from 'src/i18n';
// import { createI18n } from 'vue-i18n'; ///index'
import { createI18n } from "vue-i18n"; ///dist/vue-i18n.esm-bundler.js";

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

// console.log('i18n', i18n);

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
