import { boot } from 'quasar/wrappers';
import VueCookies from 'vue3-cookies';

const cookiesConfig = {
  expireTimes: '7d',
};

let cookies: typeof VueCookies.VueCookies;

export default boot(({ app }) => {
  app.use(VueCookies as any, cookiesConfig);
  cookies = app.config.globalProperties.$cookies as typeof VueCookies.VueCookies;
});

export { cookies };
