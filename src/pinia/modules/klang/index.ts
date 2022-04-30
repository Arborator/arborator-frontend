import api from '../../../api/backend-api';

import { defineStore } from 'pinia';
import { notifyError } from 'src/utils/notify';
import { useUserStore } from '../user';

export const useKlangStore = defineStore('klang', {
  state: () => {
    const admins: string[] = [];
    return { admins };
  },
  getters: {
    isAdmin: (state) => {
      return state.admins.includes(useUserStore().id);
    },
  },
  actions: {
    fetchKlangProjectSettings({ projectname }: { projectname: string }) {
      api
        .getKlangProjectAdmins(projectname)
        .then((response) => {
          this.admins = response.data;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
  },
});
