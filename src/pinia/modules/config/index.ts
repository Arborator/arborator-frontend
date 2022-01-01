import api from '../../../api/backend-api';

import { Notify } from 'quasar';
import defaultState from './defaultState';
import { useUserStore } from '../user';

import { defineStore } from 'pinia';
import notifyError from 'src/utils/notify';
import { project_with_diff_t } from 'src/types/main_types';

export const useConfigStore = defineStore('config', {
  state: () => {
    return defaultState();
  },
  getters: {
    getProjectConfig: (state) => state,
    infos: (state) => state,
    // KK TODO fixme all 4 below
    isAdmin: (state) => {
      return state.admins.includes(useUserStore().id);
    }, // return state.admins.includes(getters["getUserInfos"].id);
    isGuest: (state) => state.guests.includes(useUserStore().id),
    isTeacher(): boolean {
      return this.isAdmin && this.exerciseMode;
    },
    isStudent(): boolean {
      return !this.isAdmin && this.exerciseMode;
    },
    getAnnofjson: (state) => JSON.stringify(state.annotationFeatures, null, 4),
    shownmetachoices: (state) => state.annotationFeatures.META,
    shownfeatureschoices: (state) =>
      ['FORM', 'UPOS', 'LEMMA'].concat(
        state.annotationFeatures.FEATS.map(({ name }) => `FEATS.${name}`).concat(
          state.annotationFeatures.MISC ? state.annotationFeatures.MISC.map(({ name }) => `MISC.${name}`) : []
        )
      ),
    cleanedImage: (state) => {
      let ifImageNotEmpty;
      if (state.image !== null) {
        let clean = state.image.replace('b', '');
        clean = clean.replace(/^'/g, '');
        clean = clean.replace(/'$/g, '');
        ifImageNotEmpty = `data:image/png;base64, ${clean}`;
      }

      const ifImageEmpty = '/images/niko-photos-tGTVxeOr_Rs-unsplash.jpg';

      if (state.image === null) {
        state.image = "b''";
      }
      if (state.image === "b''") {
        return ifImageEmpty;
      }
      if (state.image.length < 1) {
        return ifImageEmpty;
      }
      return ifImageNotEmpty;
    },
  },
  actions: {
    /*
     * For now, `configShown` regroup information about `shownmeta` and `shownfeatures`
     * while `configConllu` regroup the information about `annotationfeatures`
     * both of these config are saved on different servers (resp arborator-flask and grew_server)
     * so we need to keep separate the logic in Vuex, API calls and so on
     */
    fetchProjectSettings({ projectname }: { projectname: string }) {
      api
        .getProject(projectname)
        .then((response) => {
          this.name = response.data.projectName;
          this.showAllTrees = response.data.showAllTrees;
          this.exerciseMode = response.data.exerciseMode;
          this.diffMode = response.data.diffMode;
          this.diffUserId = response.data.diffUserId;
          this.visibility = response.data.visibility;
          this.image = response.data.image;
          this.description = response.data.description;
        })
        .catch((error) => {
          notifyError({ error });
          api.getProjectUsersAccess(projectname).then((response) => {
            this.admins = response.data.admins;
            this.guests = response.data.guests;
          });
          api.getProjectFeatures(projectname).then((response) => {
            this.shownmeta = response.data.shownmeta;
            this.shownfeatures = response.data.shownfeatures;
          });
          api.getProjectConlluSchema(projectname).then((response) => {
            let fetchedAnnotationFeatures = response.data.annotationFeatures;
            // check if there is a json in proper format, otherwise use default ConfigConllu
            if (typeof fetchedAnnotationFeatures !== 'object' || fetchedAnnotationFeatures === null) {
              // commit("reset_project_config");
              fetchedAnnotationFeatures = this.annotationFeatures;
            }
            this.annotationFeatures = fetchedAnnotationFeatures;
          });
        });
    },
    // KK TODO
    // there is still a mismatch between all name 'updateProjectSettings' and 'updateProjectSettings'
    // ... so we have to get a proper data structure of the whole setting for then having better
    // ... separation of conscerns for API calls
    putProjectDescription() {
      api
        .updateProject(this.name, { description: this.description })
        .then(() => {
          Notify.create({
            message: 'Change saved!',
          });
        })
        .catch((error) => {
          notifyError({ error });
          // message: `${error}`,
          // color: 'negative',
          // position: 'bottom',
        });
    },

    updateProjectSettings({ toUpdateObject }: { toUpdateObject: Partial<project_with_diff_t> }) {
      return new Promise((resolve, reject) => {
        api
          .updateProject(this.name, toUpdateObject)
          .then((response) => {
            this.$patch(toUpdateObject);
            notifyError({
              error: 'Change saved!',
            });
            resolve(response);
          })
          .catch((error) => {
            notifyError({
              error: error,
            });
            // message: `${error}`,
            // color: 'negative',
            // position: 'bottom',
            reject(error);
          });
      });
    },
    updateProjectShownFeatures({ projectname, toUpdateObject }: { projectname: string; toUpdateObject: any }) {
      return new Promise((resolve, reject) => {
        api
          .updateProjectFeatures(projectname, toUpdateObject)
          .then((response) => {
            this.$patch(toUpdateObject);
            Notify.create({
              message: 'Change saved!',
            });
            resolve(response);
          })
          .catch((error) => {
            Notify.create({
              message: `${error}`,
              color: 'negative',
              position: 'bottom',
            });
            reject(error);
          });
      });
    },
    postImage(newImage: string) {
      return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('files', newImage);
        api
          .uploadProjectImage(this.name, form)
          .then((response) => {
            this.$patch({ ...response.data });
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    updateProjectConlluSchema({ projectname, annotationFeatures }: { projectname: string; annotationFeatures: any }) {
      return new Promise((resolve, reject) => {
        api
          .updateProjectConlluSchema(projectname, {
            config: annotationFeatures,
          })
          .then((response) => {
            this.annotationFeatures = annotationFeatures;
            resolve(response);
          })
          .catch((error) => {
            reject(error.response.data.errors);
          });
      });
    },
    /// / for now, AnnotationFeatures is the same thing as configConllu. We need to find an appropriate short name
    resetAnnotationFeatures() {
      this.annotationFeatures = defaultState().annotationFeatures;
    },
    // KK IS IT IN KLANG STORE NOW ?
    // // method for fetching klang project's settings, currently only admins
    // fetchKlangProjectSettings({ projectname }: { projectname: string }) {
    //   api
    //     .getKlangProjectAdmins(projectname)
    //     .then((response) => {
    //       const admins = response.data;
    //       commit('set_klang_project_settings', {
    //         admins,
    //       });
    //     })
    //     .catch((error) => {
    //       notifyError({ error });
    //     });
    // },
  },
});
