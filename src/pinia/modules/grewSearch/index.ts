import { defineStore } from 'pinia';

export const useGrewSearchStore = defineStore('grewSearch', {
  state: () => {
    return {
      grewDialog: false,
      lastGrewQuery: '',
      lastGrewCommand: '',
      pendingModifications: new Set(), // set of sentence ids
    };
  },
  actions: {
    switch_grew_dialog(newDialogState: boolean) {
      this.grewDialog = newDialogState;
    },
    change_last_grew_query(query: string) {
      this.lastGrewQuery = query;
    },
    change_last_grew_command(command: string) {
      this.lastGrewCommand = command;
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
