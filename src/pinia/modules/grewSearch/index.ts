import { defineStore } from 'pinia';

export const useGrewSearchStore = defineStore('grewSearch', {
  state: () => {
    return {
      grewDialog: false,
      lastQuery: null as null | { text: string; type: 'REWRITE' | 'SEARCH' },
      pendingModifications: new Set(), // set of sentence ids
    };
  },
  actions: {
    switch_grew_dialog(newDialogState: boolean) {
      this.grewDialog = newDialogState;
    },
    change_last_grew_query(query: null | { text: string; type: 'REWRITE' | 'SEARCH' }) {
      this.lastQuery = query;
    },
    add_pending_modification(pendingModification: any) {
      this.pendingModifications.add(pendingModification);
    },
    remove_pending_modification(pendingModification: any) {
      this.pendingModifications.delete(pendingModification);
    },
    empty_pending_modification() {
      this.pendingModifications.clear();
    },
  },
});
