import { boot } from 'quasar/wrappers';
import VueCookies from 'vue3-cookies';
import { VueCookies as VueCookies_t } from 'vue3-cookies/dist/interfaces';

const cookiesConfig = {
  expireTimes: '7d',
};

let cookies: VueCookies_t;

export default boot(({ app }) => {
  app.use(VueCookies as any, cookiesConfig);
  cookies = app.config.globalProperties.$cookies as VueCookies_t;
});

export { cookies };
