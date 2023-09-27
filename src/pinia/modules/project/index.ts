import api from '../../../api/backend-api';

import defaultState from './defaultState';
import { useUserStore } from '../user';

import { defineStore } from 'pinia';
import { notifyMessage, notifyError } from 'src/utils/notify';
import { annotationFeatures_t, project_extended_t, project_with_diff_t } from 'src/api/backend-types';

export const useProjectStore = defineStore('project', {
  state: () => {
    return defaultState();
  },
  getters: {
    getProjectConfig: (state) => state,
    isOwner(state): boolean {
      return state.admins[0] === useUserStore().username;
    },
    isAdmin(state): boolean {
      return state.admins.includes(useUserStore().username) || useUserStore().super_admin;
    },
    isValidator(state): boolean {
      return state.validators.includes(useUserStore().username) || this.isAdmin;
    },
    isAnnotator(state): boolean {
      return state.annotators.includes(useUserStore().username) && !useUserStore().super_admin;
    },
    isGuest: (state) => state.guests.includes(useUserStore().username) && !useUserStore().super_admin,
    isTeacher(state): boolean {
      return this.isAdmin && state.exerciseMode;
    },
    isStudent(state): boolean {
      return !this.isAdmin && state.exerciseMode;
    },
    isProjectMember(): boolean {
      return this.isAdmin || this.isValidator || this.isAnnotator || this.isGuest;
    },
    isAllowdedToSync(): boolean {
      return useUserStore().loggedWithGithub && this.isOwner && !this.exerciseMode && !this.isTeacher;
    },
    canSaveTreeInProject(state): boolean {
      if (!useUserStore().isLoggedIn) {
        // people not logged in can't save in any case
        return false;
      }
      if (this.isTeacher) {
        // teacher can't save a tree. They can only save special tree : base_tree and teacher
        return false;
      }
      if (state.visibility === 2) {
        // anyone (logged in) can save in public project (visibility === 2)
        return true;
      }
      // in other projects all members can save tree except the guest in the private project
      return this.isAdmin || this.isValidator || this.isAnnotator;
    },
    canSeeOtherUsersTrees(state): boolean {
      if (this.isAdmin) {
        // isAdmin (admins and superadmins) can see everything in this project
        return true;
      }
      if (state.exerciseMode) {
        // if project in exercice mode, only isAdmin can see trees of others on project scale
        // (students still can see trees of teacher in difficulty 1 and 2, but this is addressed elsewhere)
        return this.isAdmin;
      }
      if (state.visibility >= 1) {
        // everyone can see trees from other in "visible" and "public" projects
        return true;
      }
      if (state.visibility == 0) {
        // only guests (and admins, but it was already returned True earlier=
        return this.isProjectMember;
      }
      return false;
    },
    getAnnofjson: (state) => JSON.stringify(state.annotationFeatures, null, 4),
    getUDAnnofJson: (state) => JSON.stringify(state.annotationFeaturesUD, null, 4),
    shownMetaChoices: (state) => state.annotationFeatures.META,
    shownFeaturesChoices: (state) =>
      ['FORM', 'UPOS', 'LEMMA', 'XPOS'].concat(
        state.annotationFeatures.FEATS.map(({ name }) => `FEATS.${name}`).concat(
          state.annotationFeatures.MISC ? state.annotationFeatures.MISC.map(({ name }) => `MISC.${name}`) : []
        )
      ),
    featuresSet(): string[] {
      let featuresSet: string[] = [];
      featuresSet = this.shownFeaturesChoices.filter((feat) => feat != 'FORM');
      featuresSet.splice(2, 0, 'DEPREL', 'HEAD');
      return featuresSet;
    },
  },
  actions: {
    /*
     * For now, `configShown` regroup information about `shownMeta` and `shownFeatures`
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
          this.freezed = response.data.freezed;
        })
        .then(() => {
          api.getProjectUsersAccess(projectname).then((response) => {
            this.admins = response.data.admins;
            this.validators = response.data.validators;
            this.annotators = response.data.annotators;
            this.guests = response.data.guests;
          });
          api.getProjectFeatures(projectname).then((response) => {
            this.shownMeta = response.data.shownMeta;
            this.shownFeatures = response.data.shownFeatures;
          });
          api
            .getProjectConlluSchema(projectname)
            .then((response) => {
              let fetchedAnnotationFeatures = response.data.annotationFeatures;
              // check if there is a json in proper format, otherwise use default ConfigConllu
              if (typeof fetchedAnnotationFeatures !== 'object' || fetchedAnnotationFeatures === null) {

                fetchedAnnotationFeatures = this.annotationFeatures;
              }
              this.annotationFeatures = fetchedAnnotationFeatures;
            })
            .catch((error) => {
              notifyError({ error });
            });
        });
    },
    // KK TODO
    // there is still a mismatch between all name 'updateProjectSettings' and 'updateProjectSettings'
    // ... so we have to get a proper data structure of the whole setting for then having better
    // ... separation of conscerns for API calls
   
    updateProjectSettings(projectName: string, toUpdateObject: Partial<project_extended_t | project_with_diff_t>) {
      return new Promise((resolve, reject) => {
        api
          .updateProject(projectName, toUpdateObject)
          .then((response) => {
            this.$patch(toUpdateObject);
            this.reloadProjects = true;
            notifyMessage({ message: 'New project settings saved on the server', icon: 'save' });
            resolve(response);
          })
          .catch((error) => {
            notifyError({
              error: error,
            });
            reject(error);
          });
      });
    },
    updateProjectshownFeatures({ projectname, toUpdateObject }: { projectname: string; toUpdateObject: any }) {
      return new Promise((resolve, reject) => {
        api
          .updateProjectFeatures(projectname, toUpdateObject)
          .then((response) => {
            this.$patch(toUpdateObject);
            notifyMessage({ message: 'New project features saved on the server', icon: 'save' });
            resolve(response);
          })
          .catch((error) => {
            notifyError({ error });
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
    getImage(projectName: string) {
      const treeImage = '/images/niko-photos-tGTVxeOr_Rs-unsplash.jpg';
      api.getProjectImage(projectName)
      .then((response) => {
        if (Object.keys(response.data).length > 0){
          const imageData = response.data.image_data;
          const imageExt = response.data.image_ext
          this.imageSrc = `data:image/${imageExt};base64,${imageData}`;
        }
        else {
          this.imageSrc = treeImage;
        }
      })
      .catch((error) => {
        notifyError(error)
      });
    },
    updateProjectConlluSchema(projectname: string, annotationFeatures: annotationFeatures_t) {
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
    resetAnnotationFeatures(): void {
      this.annotationFeatures = defaultState().annotationFeatures;
    },
    resetAnnotationFeaturesUD(): void {
      this.annotationFeatures = defaultState().annotationFeaturesUD;
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
