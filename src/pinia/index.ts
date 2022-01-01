import { useConfigStore } from './modules/config';
import { useUserStore } from './modules/user';
import { useKlangStore } from './modules/klang';

import { useRoute } from 'vue-router';

import { defineStore } from 'pinia';

export const usMainStore = defineStore('main', {
  state: () => {
    return {
      // source: "https://127.0.0.1:5000",
      // source: "https://arboratorgrew.elizia.net:8888",
      source: process.env.API,
      lastGrewQuery: '',
      lastGrewCommand: '',
      pendingModifications: new Set(), // set of sentence ids,
      desiredUrl: '',
    };
  },
  getters: {
    getUserInfos: (state) => state,
    isProjectAdmin(): boolean {
      if (useUserStore().isSuperAdmin) {
        return true;
      }
      const route = useRoute();
      // Arborator
      if (route.params.projectname) {
        return useConfigStore().isAdmin;
      }
      // Klang
      if (route.params.kprojectname) {
        return useKlangStore().isAdmin;
      }
      return false;
    },
  },
  actions: {
    changeDesiredUrl({ value }: { value: string }) {
      this.desiredUrl = value;
    },
  },
});
