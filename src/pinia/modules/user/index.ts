import { defineStore } from 'pinia';
import { user_t } from 'src/api/backend-types';
import { i18n } from 'src/boot/i18n';
import { notifyError, notifyMessage } from 'src/utils/notify';

import api from '../../../api/backend-api';
import { cookies } from '../../../boot/vue-cookies';
import defaultState from './defaultState';

export const useUserStore = defineStore('user', {
  state: () => {
    return defaultState();
  },
  getters: {
    getUserInfos: (state) => state,
    isSuperAdmin: (state) => state.superAdmin,
    isLoggedIn: (state) => state.loginSuccess,
    hasLoginErrored: (state) => state.loginError,
    getFailedAccess: (state) => state.failedAccess,
    loggedWithGithub: (state) => state.authProvider === '4',
    avatar: (state) => {
      if (state.pictureUrl) return state.pictureUrl;
      return 'perm_identity';
    },
    shareEmail(state): boolean {
      return !state.notShareEmail && this.loggedWithGithub && state.email == null;
    },

    /**
     * This defines if a user is admin for a Arborator or Klang page. It will check in order if :
     * - user is super admin
     * - user is on an Arborator project page and is admin of this project
     * - user is on an Klang project page and is admin of this project
     */
  },
  actions: {
    checkSession() {
      return new Promise<void>((resolve, reject) => {
        const session = cookies.get('session');
        if (session !== null) {
          api
            .whoAmI()
            .then((response) => {
              this.loginSuccess = true;
              this.$patch(response.data);
              resolve();
            })
            .catch((error) => {
              notifyError({ error });
              console.log(error);
              reject();
            });
        } else {
          resolve();
        }
      });
    },
    logout() {
      return new Promise((resolve) => {
        console.log(`logging out user: ${this.username}`);
        api
          .logout()
          .then(() => {
            this.loginSuccess = false;
            this.$patch(defaultState());
          })
          .catch((error) => {
            console.log(error);
          });
        cookies.remove('session');
        cookies.remove('remember_token');
        this.loginSuccess = false;
        this.$patch(defaultState());
        resolve({ status: 'disconnected' });
      });
    },
    updateUserInformation(informationToUpdate: Partial<user_t>) {
      return new Promise((resolve, reject) => {
        api
          .updateUser(informationToUpdate)
          .then((response) => {
            this.$patch(informationToUpdate);
            notifyMessage({ message: i18n.global.t('settingsPage.saveModificationMessage') });
            resolve(response);
          })
          .catch((error) => {
            notifyError({ error });
            reject(error);
          });
      });
    },
  },
});
