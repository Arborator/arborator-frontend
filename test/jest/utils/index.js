// this is mapped in jest.config.js to resolve @vue/test-utils
import { Cookies, Dialog, Notify, Quasar } from 'quasar';
import * as All from 'quasar';
import { createLocalVue, shallowMount } from 'test-utils';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';

// These are to import all Quasar Components
const components = Object.keys(All).reduce((object, key) => {
  const val = All[key];
  if (val && val.component && val.component.name !== null) {
    object[key] = val;
  }
  return object;
}, {});
Vue.use(Quasar, {
  components,
  plugins: { Notify, Cookies, Dialog },
  directives: All,
});

// This is to mock up vue-il8n
export const options = { namespace: 'arboratorgrew__', name: 'ls', storage: 'local' };
export const $t = jest.fn();
export const $tc = jest.fn();
export const $n = jest.fn();
export const $d = jest.fn();
$t.mockReturnValue('');

const mockSsrContext = () => ({
  req: {
    headers: {},
  },
  res: {
    setHeader: () => undefined,
  },
});

// https://eddyerburgh.me/mock-vuex-in-vue-unit-tests
export const mountQuasar = (component, options = {}) => {
  const localVue = createLocalVue();
  const app = {};

  localVue.use(Vuex);
  localVue.use(VueRouter);
  localVue.use(Quasar);
  const store = new Vuex.Store({});
  const router = new VueRouter();

  if (options) {
    const ssrContext = options.ssr ? mockSsrContext() : null;

    if (options.cookies) {
      const cookieStorage = ssrContext ? Cookies.parseSSR(ssrContext) : Cookies;
      const { cookies } = options;
      Object.keys(cookies).forEach((key) => {
        cookieStorage.set(key, cookies[key]);
      });
    }

    if (options.plugins) {
      options.plugins.forEach((plugin) => {
        plugin({
          app,
          store,
          router,
          Vue: localVue,
          ssrContext,
        });
      });
    }
  }

  // mock vue-i18n
  const $t = () => {};
  const $tc = () => {};
  const $n = () => {};
  const $d = () => {};

  return shallowMount(component, {
    localVue,
    store,
    router,
    mocks: {
      $t,
      $tc,
      $n,
      $d,
    },
    // Injections for Components with a QPage root Element
    provide: {
      pageContainer: true,
      layout: {
        header: {},
        right: {},
        footer: {},
        left: {},
      },
    },
  });
};

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
