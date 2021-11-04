import api from 'boot/backend-api';

import { computeUniqueKey } from 'src/components/lexicon/lexiconHelper';

export default {
  namespaced: true,
  state: {
    isShowLexiconPanel: false,
    lexiconLoading: false,
    lexiconItems: [],
    lexiconModificationItemBefore: {},
    lexiconModificationItemAfter: {},
    isShowLexiconModification: false,
    couplesLexiconItemsBeforeAfter: [],
  },

  getters: {
    isShowLexiconPanel: (state) => state.isShowLexiconPanel,
    lexiconItems: (state) => state.lexiconItems,
    lexiconLoading: (state) => state.lexiconLoading,
    lexiconItemsModified: (state) => state.couplesLexiconItemsBeforeAfter.map((couple) => couple.after),
    isShowLexiconModification: (state) => state.isShowLexiconModification,
    lexiconModificationItemBefore: (state) => state.lexiconModificationItemBefore,
    lexiconModificationItemAfter: (state) => state.lexiconModificationItemAfter,
    couplesLexiconItemsBeforeAfter: (state) => state.couplesLexiconItemsBeforeAfter,
  },
  mutations: {
    show_lexicon_table(state) {
      state.isShowLexiconPanel = true;
    },
    hide_lexicon_table(state) {
      state.isShowLexiconPanel = false;
    },
    set_lexicon_items(state, { lexiconItems }) {
      state.lexiconItems = lexiconItems;
    },
    set_lexicon_modification_item(state, lexiconItem) {
      state.lexiconModificationItemBefore = lexiconItem;
      state.lexiconModificationItemAfter = lexiconItem;
    },
    set_lexicon_modified_item(state, modifedLexiconItem) {
      state.lexiconModificationItemAfter = modifedLexiconItem;
    },
    show_lexicon_modification_item(state) {
      state.isShowLexiconModification = true;
    },
  },
  actions: {
    showLexiconTable({ commit }) {
      commit('show_lexicon_table');
    },
    hideLexiconTable({ commit }) {
      commit('hide_lexicon_table');
    },
    fetchLexicon({ commit, dispatch, state }, { projectname, samplenames, treeSelection }) {
      state.lexiconLoading = true;
      api
        .getLexicon(projectname, { samplenames, treeSelection })
        .then((response) => {
          const lexiconItems = [];
          for (const lexiconItem of response.data) {
            lexiconItem.key = computeUniqueKey(lexiconItem);
            lexiconItems.push(lexiconItem);
          }
          commit('show_lexicon_table');
          commit('set_lexicon_items', { lexiconItems });
          state.lexiconLoading = false;
        })
        .catch((error) => {
          if (error.response.data.status === 418) {
            error.response.message = error.response.data.message;
            error.permanent = true;
          } else if (error.response.data.status === 204) {
            error = error.response.data.message;
          }
          dispatch('notifyError', { error }, { root: true });
          state.lexiconLoading = false;
        });
    },
    switchModal({ commit, state }) {
      state.isShowLexiconModification = !state.isShowLexiconModification;
    },
    hideLexiconModificationDialog({ commit, state }) {
      state.isShowLexiconModification = false;
    },
    setLexiconModificationItem({ commit }, lexiconItem) {
      commit('set_lexicon_modification_item', lexiconItem);
      commit('show_lexicon_modification_item');
    },
    setLexiconModifiedItem({ commit }, modifiedLexiconItem) {
      commit('set_lexicon_modified_item', modifiedLexiconItem);
    },
    addCoupleLexiconItemBeforeAfter({ dispatch, state }) {
      const before = state.lexiconModificationItemBefore;
      const after = state.lexiconModificationItemAfter;
      if (deepEqual(before, after)) {
        console.log('KK not writting, before and after are the same');
        return;
      }
      for (const couple of state.couplesLexiconItemsBeforeAfter) {
        if (before.key === couple.before.key) {
          // we already have this entry, rewrite on it
          console.log('KK rewriting');
          if (deepEqual(couple.before, after)) {
            console.log('KK After became first before aain, deleting couple');
            dispatch('removeCoupleLexiconItemBeforeAfter', couple.before.key);
            return;
          }
          couple.after = JSON.parse(JSON.stringify(after));
          return;
        }
        // if (Object.prototype.hasOwnProperty.call(state.couplesLexiconItemsBeforeAfter, couple.before))
      }
      // didn't find any couple with the same 'before' as the new one we want to add
      state.couplesLexiconItemsBeforeAfter.push({
        before: JSON.parse(JSON.stringify(before)),
        after: JSON.parse(JSON.stringify(after)),
      });
    },
    removeCoupleLexiconItemBeforeAfter({ state }, key) {
      state.couplesLexiconItemsBeforeAfter = state.couplesLexiconItemsBeforeAfter.filter((couple) => couple.before.key !== key);
    },
  },
};

function deepEqual(x, y) {
  const ok = Object.keys;
  const tx = typeof x;
  const ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? ok(x).length === ok(y).length && ok(x).every((key) => deepEqual(x[key], y[key])) : x === y;
}
