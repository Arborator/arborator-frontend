import { defineStore } from 'pinia';

export const useGrewSearchStore = defineStore('grewSearch', {
  state: () => {
    return { grewDialog: false };
  },
  actions: {
    switch_grew_dialog(newDialogState: boolean) {
      this.grewDialog = newDialogState;
    },
  },
});
