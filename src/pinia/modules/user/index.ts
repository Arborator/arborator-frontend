import defaultState from './defaultState';

import { cookies } from '../../../boot/vue-cookies';

import api from '../../../api/backend-api';
import { defineStore } from 'pinia';
import notifyError from 'src/utils/notify';

export const useUserStore = defineStore('user', {
  state: () => {
    return defaultState();
  },
  getters: {
    getUserInfos: (state) => state,
    isSuperAdmin: (state) => state.super_admin,
    isLoggedIn: (state) => state.loginSuccess,
    hasLoginErrored: (state) => state.loginError,
    getFailedAccess: (state) => state.failedAccess,
    loggedWithGithub: (state) => state.auth_provider === 4,
    avatar: (state) => {
      if (state.picture_url) return state.picture_url;
      return 'perm_identity';
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
        // var token = VueCookies.get("authomatic");
        const session = cookies.get('session');
        // if (token !== null) console.log("token", token);
        if (session !== null) {
          api
            .whoAmI()
            .then((response) => {
              this.loginSuccess = true;
              console.log('KK response.data', response.data);
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
          .then((response) => {
            console.log(response);
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
  },
});
