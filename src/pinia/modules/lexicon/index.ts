import api from '../../../api/backend-api';

import { defineStore } from 'pinia';
import { notifyError } from 'src/utils/notify';
import { lexiconItem_t } from 'src/api/backend-types';

export interface lexiconItem_FE_t extends lexiconItem_t {
  key: string;
}

export const useLexiconStore = defineStore('lexicon', {
  state: () => {
    return {
      principalFeatures: [] as string[],
      secondaryFeatures: [] as string[],
      lexiconLoading: false as boolean,
      lexiconItems: [] as lexiconItem_FE_t[],
      lexiconModificationItemBefore: {} as lexiconItem_FE_t,
      lexiconModificationItemAfter: {} as lexiconItem_FE_t,
      isShowLexiconModification: false,
      couplesLexiconItemsBeforeAfter: [] as { before: lexiconItem_FE_t; after: lexiconItem_FE_t }[],
    };
  },
  getters: {
    lexiconItemsModified: (state) => state.couplesLexiconItemsBeforeAfter.map((couple) => couple.after),
  },
  actions: {
    purgeCurrentState() {
      this.lexiconItems = [];
      this.lexiconModificationItemBefore = {} as lexiconItem_FE_t;
      this.lexiconModificationItemAfter = {} as lexiconItem_FE_t;
      this.isShowLexiconModification = false;
      this.couplesLexiconItemsBeforeAfter = [];
    },
    fetchLexicon(projectname: string, data: any) {
      this.lexiconLoading = true;
      this.purgeCurrentState();
      api
        .getLexicon(projectname, data)
        .then((response) => {
          this.lexiconLoading = false;
          const lexiconItems = [];
          for (const lexiconItem_BE of response.data) {
            const lexiconItem_FE = { ...lexiconItem_BE, key: computeUniqueKey(lexiconItem_BE) };
            lexiconItems.push(lexiconItem_FE);
          }
          this.lexiconItems = lexiconItems;
        })
        .catch((error) => {
          this.lexiconLoading = false;
          if (error.response.data.status === 418) {
            error.response.message = error.response.data.message;
            error.permanent = true;
          } else if (error.response.data.status === 204) {
            error = error.response.data.message;
          }
          notifyError({ error });
        });
    },
    switchModal() {
      this.isShowLexiconModification = !this.isShowLexiconModification;
    },
    hideLexiconModificationDialog() {
      this.isShowLexiconModification = false;
    },
    setLexiconModificationItem(lexiconItem: lexiconItem_FE_t) {
      this.lexiconModificationItemBefore = lexiconItem;
      this.lexiconModificationItemAfter = lexiconItem;
      this.isShowLexiconModification = true;
    },
    setLexiconModifiedItem(modifiedLexiconItem: lexiconItem_FE_t) {
      this.lexiconModificationItemAfter = modifiedLexiconItem;
    },
    addCoupleLexiconItemBeforeAfter() {
      const before = this.lexiconModificationItemBefore;
      const after = this.lexiconModificationItemAfter;
      if (deepEqual(before, after)) {
        return;
      }
      for (const couple of this.couplesLexiconItemsBeforeAfter) {
        if (before.key === couple.before.key) {
          // we already have this entry, rewrite on it
          if (deepEqual(couple.before, after)) {
            this.removeCoupleLexiconItemBeforeAfter(couple.before.key);
            return;
          }
          couple.after = JSON.parse(JSON.stringify(after));
          return;
        }
        // if (Object.prototype.hasOwnProperty.call(state.couplesLexiconItemsBeforeAfter, couple.before))
      }
      // didn't find any couple with the same 'before' as the new one we want to add
      this.couplesLexiconItemsBeforeAfter.push({
        before: JSON.parse(JSON.stringify(before)),
        after: JSON.parse(JSON.stringify(after)),
      });
    },
    removeCoupleLexiconItemBeforeAfter(key: string) {
      this.couplesLexiconItemsBeforeAfter = this.couplesLexiconItemsBeforeAfter.filter((couple) => couple.before.key !== key);
    },
  },
});

function deepEqual(x: Record<string, any>, y: Record<string, any>): boolean {
  const ok = Object.keys;
  const tx = typeof x;
  const ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? ok(x).length === ok(y).length && ok(x).every((key) => deepEqual(x[key], y[key])) : x === y;
}

function computeUniqueKey(lexiconItem: lexiconItem_t) {
  let uniqueKey = '';
  for (const value of Object.values(lexiconItem.feats)) {
    if (value) {
      uniqueKey += value;
    }
  }
  return uniqueKey;
}
