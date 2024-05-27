import { defineStore } from 'pinia';
import { annotationFeatures_t, project_extended_t, project_t } from 'src/api/backend-types';
import { notifyError, notifyMessage } from 'src/utils/notify';

import api from '../../../api/backend-api';
import { useUserStore } from '../user';
import defaultState from './defaultState';

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
      return state.admins.includes(useUserStore().username) || useUserStore().superAdmin;
    },
    isValidator(state): boolean {
      return state.validators.includes(useUserStore().username) || this.isAdmin;
    },
    isAnnotator(state): boolean {
      return state.annotators.includes(useUserStore().username) && !useUserStore().superAdmin;
    },
    isGuest: (state) => state.guests.includes(useUserStore().username) && !useUserStore().superAdmin,
    isStudent(state): boolean {
      return !this.isValidator && state.blindAnnotationMode;
    },
    isProjectMember(): boolean {
      return this.isAdmin || this.isValidator || this.isAnnotator || this.isGuest;
    },
    isAllowdedToSync(): boolean {
      return useUserStore().loggedWithGithub && this.isOwner && !this.blindAnnotationMode;
    },
    canSaveTreeInProject(state): boolean {
      if (!useUserStore().isLoggedIn) {
        // people not logged in can't save in any case
        return false;
      }
      if (this.isGuest) {
        return false;
      }
      if (!this.collaborativeMode) {
        return false;
      }
      if (this.isValidator && this.blindAnnotationMode) {
        // In the blind annotation Validator can't save a tree. They can only save special tree : base_tree and Validated
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
      if (state.blindAnnotationMode) {
        // if project in blind annotation mode, only isValidator can see trees of others on project scale
        // (students still can see Validated trees in difficulty 1 and 2, but this is addressed elsewhere)
        return this.isValidator;
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
    canExportTrees(state): boolean {
      return !state.blindAnnotationMode || (useUserStore().isLoggedIn && !this.isGuest);
    },
    getAnnotationSetting(): string {
      return this.config === 'ud' ? this.getUDAnnofJson : this.getSUDAnnofJson;
    },
    getSUDAnnofJson: (state) => JSON.stringify(state.annotationFeatures, null, 4),
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
    resetAnnotationFeatures(): void {
      this.annotationFeatures = defaultState().annotationFeatures;
    },
    resetAnnotationFeaturesUD(): void {
      this.annotationFeatures = defaultState().annotationFeaturesUD;
    },
    fetchProjectSettings({ projectName }: { projectName: string }) {
      api
        .getProject(projectName)
        .then((response) => {
          this.name = response.data.projectName;
          this.blindAnnotationMode = response.data.blindAnnotationMode;
          this.diffMode = response.data.diffMode;
          this.diffUserId = response.data.diffUserId;
          this.visibility = response.data.visibility;
          this.description = response.data.description;
          this.freezed = response.data.freezed;
          this.config = response.data.config;
          this.language = response.data.language;
          this.collaborativeMode = response.data.collaborativeMode;
        })
        .then(() => {
          api.getProjectImage(projectName).then((response) => {
            this.image = response.data;
          });
          api.getProjectUsersAccess(projectName).then((response) => {
            this.admins = response.data.admins;
            this.validators = response.data.validators;
            this.annotators = response.data.annotators;
            this.guests = response.data.guests;
          });
          api.getProjectFeatures(projectName).then((response) => {
            this.shownMeta = response.data.shownMeta;
            this.shownFeatures = response.data.shownFeatures;
          });
          api
            .getProjectConlluSchema(projectName)
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
    updateProjectSettings(projectName: string, toUpdateObject: Partial<project_extended_t | project_t>) {
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
            notifyError({ error: error });
            reject(error);
          });
      });
    },
    updateProjectshownFeatures({ projectName, toUpdateObject }: { projectName: string; toUpdateObject: any }) {
      return new Promise((resolve, reject) => {
        api
          .updateProjectFeatures(projectName, toUpdateObject)
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
    postImage(newImage: any) {
      return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('files', newImage);
        api
          .uploadProjectImage(this.name, form)
          .then((response) => {
            notifyMessage({ message: 'New image is uploaded to the project' });
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    updateProjectConlluSchema(projectName: string, annotationFeatures: annotationFeatures_t) {
      return new Promise((resolve, reject) => {
        api
          .updateProjectConlluSchema(projectName, {
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
  },
});
