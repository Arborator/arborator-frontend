import { defineStore } from 'pinia';

import { useProjectStore } from '../project';

export const useGrewSearchStore = defineStore('grewSearch', {
  state: () => {
    return {
      grewDialog: false,
      lastQuery: null as null | { text: string; type: 'REWRITE' | 'SEARCH'; userType: string },
      pendingModifications: new Map(), // set of sentence ids
      treeTypes: ['user', 'user_recent', 'recent', 'validated', 'pending', 'base_tree', 'all', 'others'],
    };
  },
  getters: {
    grewTreeTypes(): string[] {
      if (!useProjectStore().collaborativeMode) {
        return this.treeTypes.filter((element) => element === 'validated');
      } else if (useProjectStore().blindAnnotationMode) {
        if (useProjectStore().canSaveTreeInProject) {
          return this.treeTypes.filter((element) => element == 'user');
        } else {
          return this.treeTypes.filter((element) => ['validated', 'base_tree', 'all'].includes(element));
        }
      } else {
        if (!useProjectStore().canSaveTreeInProject) {
          return this.treeTypes.filter((element) => ['recent', 'validated', 'all'].includes(element));
        } else {
          return this.treeTypes.filter((element) => element != 'base_tree');
        }
      }
    },
    canRewriteRule(): boolean {
      if (useProjectStore().blindAnnotationMode || !useProjectStore().collaborativeMode) {
        return useProjectStore().isValidator;
      } else {
        return useProjectStore().canSaveTreeInProject;
      }
    },
  },
  actions: {
    switchGrewDialog(newDialogState: boolean) {
      this.grewDialog = newDialogState;
    },
    changeLastGrewQuery(query: null | { text: string; type: 'REWRITE' | 'SEARCH'; userType: string }) {
      this.lastQuery = query;
    },
    addPendingModification(sentId: string, conll: string) {
      this.pendingModifications.set(sentId, conll);
    },
    removePendingModification(pendingModification: any) {
      this.pendingModifications.delete(pendingModification);
    },
    emptyPendingModification() {
      this.pendingModifications.clear();
    },
  },
});
