import { useProjectStore } from './modules/project';
import { useUserStore } from './modules/user';
import { useKlangStore } from './modules/klang';

import { useRoute } from 'vue-router';

import { defineStore } from 'pinia';

export const useMainStore = defineStore('main', {
  state: () => {
    return {
      // source: "https://127.0.0.1:5000",
      // source: "https://arboratorgrew.elizia.net:8888",
      source: process.env.API,
      desiredUrl: '',
    };
  },
  getters: {
    isProjectAdmin(): boolean {
      if (useUserStore().isSuperAdmin) {
        return true;
      }
      const route = useRoute();
      // Arborator
      if (route.params.projectname) {
        return useProjectStore().isAdmin;
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
