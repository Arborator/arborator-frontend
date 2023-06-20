import { boot } from 'quasar/wrappers';
import { VueMatomo } from 'vue-matomo';
import routes from '../router/routes';
import Router from '../router/index';
export default boot(({ app }) => {
    app.use(VueMatomo, {
        host: 'https://matomo.elizia.net',
        siteId: 1,
        trackerFileName: 'matomo',
        router: Router,
        enableLinkTracking: true,
        requireConsent: false,
        trackInitialView: true,
        disableCookies: false,
        requireCookieConsent: false,
        enableHeartBeatTimer: false,
        debug: false,
        userId: undefined,
        cookieDomain: undefined,
        domains: undefined,
        preInitActions: [],
        trackSiteSearch: false,
        crossOrigin: undefined,
    });
  });


