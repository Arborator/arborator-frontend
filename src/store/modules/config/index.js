import api from "boot/backend-api";

import defaultState from "./defaultState";

import { Notify } from "quasar";

export default {
  namespaced: true,
  state: defaultState(),
  getters: {
    getProjectConfig: (state) => state,
    infos: (state) => state,
    admins: (state) => state.admins,
    guests: (state) => state.guests,
    isAdmin: (state, getters, rootSate) => {
      return state.admins.includes(rootSate.user.id);
      // return state.admins.includes(getters["getUserInfos"].id);
    },
    isGuest: (state, getters, rootState) => {
      return state.guests.includes(rootState.user.id);
    },
    isTeacher: (state, getters) => {
      return getters.isAdmin && getters.exerciseMode;
    },
    visibility: (state) => state.visibility,
    showAllTrees: (state) => state.showAllTrees,
    exerciseMode: (state) => state.exerciseMode,
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
    image: (state) => {
      var clean = state.image.replace("b", "");
      clean = clean.replace(/^'/g, "");
      clean = clean.replace(/'$/g, "");
      var ifImageNotEmpty = "data:image/png;base64, " + clean;

      var ifImageEmpty =
        "../statics/images/niko-photos-tGTVxeOr_Rs-unsplash.jpg";

      if (state.image == null) {
        state.image = "b''";
      }
      if (state.image == "b''") {
        return ifImageEmpty;
      } else if (state.image.length < 1) {
        return ifImageEmpty;
      } else {
        return ifImageNotEmpty;
      }
    },
  },
  mutations: {
    set_project_settings(state, payload) {
      state = Object.assign(state, payload);
    },
    set_project_conllu_schema(state, payload) {
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
    fetchProjectSettings({ commit, state }, { projectname }) {
      api
        .getProject(projectname)
        .then((response) => {
          commit("set_project_settings", {
            showAllTrees: response.data.show_all_trees,
            exerciseMode: response.data.exercise_mode,
            visibility: response.data.visibility,
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
      api.getProjectUsersAccess(projectname).then((response) => {
        commit("set_project_settings", {
          admins: response.data.admins,
          guests: response.data.guests,
        });
      });
      api.getProjectFeatures(projectname).then((response) => {
        commit("set_project_settings", {
          shownmeta: response.data.shownmeta,
          shownfeatures: response.data.shownfeatures,
        });
      });
      api.getProjectConllSchema(projectname).then((response) => {
        var fetchedAnnotationFeatures = response.data.annotationFeatures;
        // check if there is a json in proper format, otherwise use default ConfigConllu
        if (
          typeof fetchedAnnotationFeatures !== "object" ||
          fetchedAnnotationFeatures === null
        ) {
          // commit("reset_project_config");
          fetchedAnnotationFeatures = state.annotationFeatures;
        }
        commit("set_project_conllu_schema", {
          annotationFeatures: fetchedAnnotationFeatures,
        });
      });

      // api
      //   .getProjectSettings(projectname)
      //   .then((response) => {
      //     commit("set_project_settings", {
      //       shownfeatures: response.data.config.shownfeatures,
      //       admins: response.data.admins,
      //       guests: response.data.guests,
      //       shownmeta: response.data.config.shownmeta,
      //       showAllTrees: response.data.show_all_trees,
      //       exerciseMode: response.data.exercise_mode,
      //       visibility: response.data.visibility,
      //     });
      //   })
      //   .catch((error) => {
      //     this.$store.dispatch("notifyError", { error: error });
      //     // this.$q.notify({
      //     // message: `${error}`,
      //     // color: "negative",
      //     // position: "bottom",
      //     // });
      //   });
    },
    // fetchConfigShown({ commit }, { projectname }) {
    //   api
    //     .getProjectSettings(projectname)
    //     .then((response) => {
    //       commit("set_project_settings", {
    //         admins: response.data.admins,
    //         guests: response.data.guests,
    //         shownfeatures: response.data.config.shownfeatures,
    //         shownmeta: response.data.config.shownmeta,
    //         showAllTrees: response.data.show_all_trees,
    //       });
    //     })
    //     .catch((error) => {
    //       this.$store.dispatch("notifyError", { error: error });
    //       // this.$q.notify({
    //       // message: `${error}`,
    //       // color: "negative",
    //       // position: "bottom",
    //       // });
    //     });
    // },
    // there is still a mismatch between all name 'updateProjectSettings' and 'updateProjectSettings'
    // ... so we have to get a proper data structure of the whole setting for then having better
    // ... separation of conscerns for API calls
    // KK TODO
    updateProjectSettings(
      { commit, dispatch },
      { projectname, toUpdateObject }
    ) {
      return new Promise((resolve, reject) => {
        api
          .updateProject(projectname, toUpdateObject)
          .then((response) => {
            commit("set_project_settings", { ...toUpdateObject });
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
    // // KK refactor : change naming (-> conllu-schema)
    // fetchProjectConlluSchema({ commit, state }, { projectname }) {
    //   return new Promise((resolve, reject) => {
    //     api
    //       .getProjectConllSchema(projectname)
    //       .then((response) => {
    //         var fetchedAnnotationFeatures = response.data.annotationFeatures;
    //         // check if there is a json in proper format, otherwise use default ConfigConllu
    //         if (
    //           typeof fetchedAnnotationFeatures !== "object" ||
    //           fetchedAnnotationFeatures === null
    //         ) {
    //           // commit("reset_project_config");
    //           fetchedAnnotationFeatures = state.annotationFeatures;
    //         }
    //         commit("set_project_conllu_schema", {
    //           annotationFeatures: fetchedAnnotationFeatures,
    //         });
    //         resolve(response);
    //       })
    //       .catch((error) => {
    //         reject(error.response.data.errors);
    //       });
    //   });
    // },
    updateProjectConlluSchema({ commit }, { projectname, annotationFeatures }) {
      return new Promise((resolve, reject) => {
        api
          .updateProjectConlluSchema(projectname, {
            config: annotationFeatures,
          })
          .then((response) => {
            commit("set_project_conllu_schema", {
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
