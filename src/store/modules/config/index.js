import api from "boot/backend-api";

import defaultState from "./defaultState";

import { Notify } from "quasar";

export default {
  namespaced: true,
  state: defaultState(),
  getters: {
    getProjectConfig: (state) => state,
    admins: (state) => state.admins,
    guests: (state) => state.guests,
    isAdmin: (state, getters, rootSate) => {
      return state.admins.includes(rootSate.user.id);
      // return state.admins.includes(getters["getUserInfos"].id);
    },
    showAllTrees: (state) => state.showAllTrees,
    shownfeatures: (state) => state.shownfeatures,
    shownmeta: (state) => state.shownmeta,
    annotationFeatures: (state) => state.annotationFeatures,
    getAnnofjson: (state) => {
      return JSON.stringify(state.annotationFeatures, null, 4);
    },
    shownmetachoices: (state) => {
      return state.annotationFeatures.META;
    },
    shownfeatureschoices: (state) =>
      ["FORM", "UPOS", "LEMMA"].concat(
        state.annotationFeatures.FEATS.map(
          ({ name }) => "FEATS." + name
        ).concat(
          state.annotationFeatures.MISC.map(({ name }) => "MISC." + name)
        )
      ),
  },
  mutations: {
    set_project_config(state, payload) {
      state = Object.assign(state, payload);
    },
    reset_annotation_features(state) {
      Object.assign(
        state.annotationFeatures,
        defaultState().annotationFeatures
      );
    },
  },
  actions: {
    /*
     * For now, `configShown` regroup information about `shownmeta` and `shownfeatures`
     * while `configConllu` regroup the information about `annotationfeatures`
     * both of these config are saved on different servers (resp arborator-flask and grew_server)
     * so we need to keep separate the logic in Vuex, API calls and so on
     */

    fetchConfigShown({ commit }, { projectname }) {
      api
        .getProjectSettings(projectname)
        .then((response) => {
          commit("set_project_config", {
            admins: response.data.admins,
            guests: response.data.guests,
            shownfeatures: response.data.config.shownfeatures,
            shownmeta: response.data.config.shownmeta,
            showAllTrees: response.data.show_all_trees,
          });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
          // this.$q.notify({
          // message: `${error}`,
          // color: "negative",
          // position: "bottom",
          // });
        });
    },
    // there is still a mismatch between all name 'updateProjectSettings' and 'updateConfigShown' ...
    // ... so we have to get a proper data structure of the whole setting for then having better  ...
    // ... separation of conscerns for API calls
    updateConfigShown({ commit, dispatch }, { projectname, toUpdateObject }) {
      return new Promise((resolve, reject) => {
        api
          .updateProjectSettings(projectname, toUpdateObject)
          .then((response) => {
            commit("set_project_config", { ...toUpdateObject });
            Notify.create({
              message: `Change saved!`,
            });
            resolve(response);
          })
          .catch((error) => {
            dispatch("notifyError", { error: error }, { root: true });
            Notify.create({
              message: `${error}`,
              color: "negative",
              position: "bottom",
            });
            reject(error);
          });
      });
    },
    fetchConfigConllu({ commit, state }, { projectname }) {
      return new Promise((resolve, reject) => {
        api
          .getProjectConfig(projectname)
          .then((response) => {
            var fetchedAnnotationFeatures = response.data.data;
            // check if there is a json in proper format, otherwise use default ConfigConllu
            if (
              typeof fetchedAnnotationFeatures !== "object" ||
              fetchedAnnotationFeatures === null
            ) {
              commit("reset_project_config");
              fetchedAnnotationFeatures = state.annotationFeatures;
            }
            commit("set_project_config", {
              annotationFeatures: fetchedAnnotationFeatures,
            });
            resolve(response);
          })
          .catch((error) => {
            reject(error.response.data.errors);
          });
      });
    },
    updateConfigConllu({ commit }, { projectname, annotationFeatures }) {
      return new Promise((resolve, reject) => {
        api
          .updateProjectConfig(projectname, { config: annotationFeatures })
          .then((response) => {
            commit("set_project_config", {
              annotationFeatures: annotationFeatures,
            });
            resolve(response);
          })
          .catch((error) => {
            reject(error.response.data.errors);
          });
      });
    },
    //// for now, AnnotationFeatures is the same thing as configConllu. We need to find an appropriate short name
    resetAnnotationFeatures({ commit }) {
      commit("reset_annotation_features");
    },
  },
};
