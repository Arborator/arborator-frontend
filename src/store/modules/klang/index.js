import api from 'boot/backend-api';

export default {
  namespaced: true,
  state: {
    admins: [],
    projectconfig: {},
  },
  getters: {
    admins: (state) => state.admins,

    isAdmin: (state, getters, rootState, rootGetters) => state.admins.includes(rootState.user.id) || rootGetters['user/isSuperAdmin'],
  },
  mutations: {
    // Set admins for klang projects
    set_klang_project_settings(state, newAdmins) {
      state.admins = newAdmins;
    },
  },
  actions: {
    // method for fetching klang project's settings, currently only admins
    fetchKlangProjectSettings({ commit }, { projectname }) {
      api
        .getKlangProjectAdmins(projectname)
        .then((response) => {
          const newAdmins = response.data;
          commit('set_klang_project_settings', newAdmins);
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
        });
    },
  },
};
