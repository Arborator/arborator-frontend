import api from "boot/backend-api";

import defaultState from "./defaultState";

export default {
  namespaced: true,
  state: defaultState(),
  getters: {
    getProjectConfig: (state) => state,
    shownfeatures: (state) => state.shownfeatures,
    shownmeta: (state) => state.shownmeta,
    annotationFeatures: (state) => state.annotationFeatures,
    getAnnofjson: (state) => {
      return JSON.stringify(state.annotationFeatures, null, 4);
    },
    shownmetachoices: (state) => {state.annotationFeatures.META},
    shownfeatureschoices: (state) => ['FORM','UPOS','LEMMA'].concat(state.annotationFeatures.FEATS.map(({ name }) => 'FEATS.'+name).concat(state.annotationFeatures.MISC.map(({ name }) => 'MISC.'+name)))
  },
  mutations: {
    set_project_config(state, payload) {
      state = Object.assign(state, payload);
    },
    reset_store_config(state) {
      Object.assign(state, defaultState());
    },
  },
  actions: {
    getConfigConllu({ commit, state }, { projectname }) {
      return new Promise((resolve, reject) => {
        api
          .getProjectConfig(projectname)
          .then((response) => {
            console.log("KK project name", projectname);
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
            console.log("KK error", error);
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
    resetProjectConfig({ commit }) {
      // return new Promise((resolve, reject) => {
      commit("reset_store_config");
      // dispatch("updateConfigConllu", {
      //     projectname:projectname,
      //     annotationFeatures: state.projectConfig.annotationFeatures
      // });
      // resolve(1)
      // })
    },
  },
};
