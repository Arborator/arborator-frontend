export default {
  namespaced: true,
  state: {
    grewDialog: false,
  },
  getters: {
    grewDialog: (state) => state.grewDialog,
  },
  mutations: {
    SWITCH_GREW_DIALOG(state, payload) {
      state.grewDialog = payload;
    },
  },
  actions: {
    switch_grew_dialog({ commit }, payload) {
      commit('SWITCH_GREW_DIALOG', payload);
    },
  },
};
