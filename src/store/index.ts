import { InjectionKey } from 'vue';
import { MutationTree, Store as VuexStore } from 'vuex';
import { GetterTree, ActionTree, createStore } from 'vuex';
import { Notify } from 'quasar';
import { i18n } from 'src/boot/i18n';
import config from './modules/config';
import user from './modules/user';
import grewSearch from './modules/grewSearch';
import sample from './modules/sample';
import lexicon from './modules/lexicon';
import klang from './modules/klang';

export interface StateInterface {
  // root state
  source: string | undefined;
  lastGrewQuery: string;
  lastGrewCommand: string;
  desiredUrl: string;
  pendingModifications: Set<number> | Set<unknown>;
  // user: UserStateInterface
  // Define your own store structure, using submodules if needed
  // example: ExampleStateInterface;
  // Declared as unknown to avoid linting issue. Best to strongly type as per the line above.
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<StateInterface>;
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> = Symbol('vuex-key');

const rootMutations: MutationTree<StateInterface> = {
  // seems to be not use
  change_source(state, payload) {
    state.source = payload;
  },
  change_last_grew_query(state, payload) {
    state.lastGrewQuery = payload;
  },
  change_last_grew_command(state, payload) {
    state.lastGrewCommand = payload;
  },
  add_pending_modification(state, payload) {
    state.pendingModifications.add(payload);
  },
  remove_pending_modification(state, payload) {
    state.pendingModifications.delete(payload);
  },
  empty_pending_modification(state) {
    state.pendingModifications.clear();
  },
};

const rootActions: ActionTree<StateInterface, unknown> = {
  changeDesiredUrl({ commit, state }, { value }) {
    state.desiredUrl = value;
    commit('desiredurl_modified', { value });
  },
  changePendingModifications({ commit }, { value }) {
    commit('change_pending_modifications', { value });
  },
  // seems to be not used
  accessFailed({ commit }) {
    commit('access_failed');
  },
  // seems to be not used
  updateUser({ commit }, payload) {
    commit('update_user', payload);
  },
  notifyError({ commit }, { error, timeout }) {
    let msg;
    let caption = '';
    if (error.message !== undefined) {
      msg = error.message;
    } else if (error.response) {
      if (error.response.status === 403) {
        msg = error.response.message ? error.response.message : i18n.global.t('error403');
      } else if (error.response.status === 401) {
        msg = error.response.message ? error.response.message : i18n.global.t('error401');
      } else {
        msg = error.response.message ? error.response.message : `${error.response.statusText} error ${error.response.status}`;
      }
    } else {
      msg = `oops${error}`;
    }
    if (error.caption) {
      caption = error.caption;
    }
    if (error.permanent) {
      Notify.create({
        message: msg,
        position: 'top-right',
        color: 'negative',
        icon: 'warning',
        caption,
        timeout: 0,
        closeBtn: 'Dismiss',
        html: true,
      });
    } else {
      timeout = timeout || 5000;
      Notify.create({
        message: msg,
        position: 'top-right',
        color: 'negative',
        icon: 'warning',
        caption,
        timeout,
      });
    }
  },
};

const rootGetters: GetterTree<StateInterface, unknown> = {
  getSource: (state) => state.source,
  getLastGrewQuery: (state) => state.lastGrewQuery,
  getLastGrewCommand: (state) => state.lastGrewCommand,
  getPendingModifications: (state) => state.pendingModifications,
};

// export default store(function (/* { ssrContext } */) {
const Store = createStore<StateInterface>({
  modules: {
    config,
    sample,
    user,
    grewSearch,
    lexicon,
    klang,
  },
  state: {
    // source: "https://127.0.0.1:5000",
    // source: "https://arboratorgrew.elizia.net:8888",
    source: process.env.API,
    lastGrewQuery: '',
    lastGrewCommand: '',
    pendingModifications: new Set(), // set of sentence ids,
    desiredUrl: '',
  },
  mutations: rootMutations,
  actions: rootActions,
  getters: rootGetters,
});
// return Store;
export default Store;
// })
