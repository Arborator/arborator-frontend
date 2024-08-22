import { defineStore } from 'pinia';
import { useRoute } from 'vue-router';

import { useKlangStore } from './modules/klang';
import { useProjectStore } from './modules/project';
import { useUserStore } from './modules/user';

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
