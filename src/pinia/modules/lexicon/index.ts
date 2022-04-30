import api from '../../../api/backend-api';

import { defineStore } from 'pinia';
import { notifyError } from 'src/utils/notify';

export const useLexiconStore = defineStore('lexicon', {
  state: () => {
    return {
      isShowLexiconPanel: false,
      lexiconLoading: false,
      lexiconItems: [] as any[],
      lexiconModificationItemBefore: {} as any,
      lexiconModificationItemAfter: {} as any,
      isShowLexiconModification: false,
      couplesLexiconItemsBeforeAfter: [] as { before: any; after: any }[],
    };
  },
  getters: {
    lexiconItemsModified: (state) => state.couplesLexiconItemsBeforeAfter.map((couple) => couple.after),
  },
  actions: {
    showLexiconTable() {
      this.isShowLexiconPanel = true;
    },
    hideLexiconTable() {
      this.isShowLexiconPanel = false;
    },
    fetchLexicon(projectname: string, samplenames: string[], treeSelection: string) {
      this.lexiconLoading = true;
      api
        .getLexicon(projectname, { samplenames, treeSelection })
        .then((response) => {
          const lexiconItems = [];
          for (const lexiconItem of response.data) {
            lexiconItem.key = computeUniqueKey(lexiconItem);
            lexiconItems.push(lexiconItem);
          }
          this.isShowLexiconPanel = true;
          this.lexiconItems = lexiconItems;
          this.lexiconLoading = false;
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
    setLexiconModificationItem(lexiconItem: any) {
      this.lexiconModificationItemBefore = lexiconItem;
      this.lexiconModificationItemAfter = lexiconItem;
      this.isShowLexiconModification = true;
    },
    setLexiconModifiedItem(modifiedLexiconItem: any) {
      this.lexiconModificationItemAfter = modifiedLexiconItem;
    },
    addCoupleLexiconItemBeforeAfter() {
      const before = this.lexiconModificationItemBefore;
      const after = this.lexiconModificationItemAfter;
      if (deepEqual(before, after)) {
        console.log('KK not writting, before and after are the same');
        return;
      }
      for (const couple of this.couplesLexiconItemsBeforeAfter) {
        if (before.key === couple.before.key) {
          // we already have this entry, rewrite on it
          console.log('KK rewriting');
          if (deepEqual(couple.before, after)) {
            console.log('KK After became first before aain, deleting couple');
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
