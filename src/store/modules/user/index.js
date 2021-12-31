import api from '../../../api/backend-api';

import { useRoute } from 'vue-router';

import defaultState from './defaultState';

// import { Notify } from "quasar";
import { cookies } from '../../../boot/vue-cookies';

export default {
  namespaced: true,
  state: defaultState(),

  getters: {
    getUserInfos: (state) => state,
    isSuperAdmin: (state) => state.super_admin,
    /**
     * This defines if a user is admin for a Arborator or Klang page. It will check in order if :
     * - user is super admin
     * - user is on an Arborator project page and is admin of this project
     * - user is on an Klang project page and is admin of this project
     */
    isProjectAdmin: (state, getters, rootState, rootGetters) => {
      if (state.super_admin) {
        return true;
      }

      const route = useRoute();
      // Arborator
      if (route.params.projectname) {
        return rootGetters['config/isAdmin'];
      }
      // Klang
      if (route.params.kprojectname) {
        return rootGetters['klang/isAdmin'];
      }
      return false;
    },
    isLoggedIn: (state) => state.loginSuccess,
    hasLoginErrored: (state) => state.loginError,
    getFailedAccess: (state) => state.failedAccess,
    getAvatarKey: (state) => state.avatarKey,
    loggedWithGithub: (state) => state.auth_provider === 4,
    avatar: (state) => {
      if (state.picture_url) return state.picture_url;
      return 'perm_identity';
    },
  },
  mutations: {
    login_success(state) {
      state.loginSuccess = true;
    },
    login_error(state) {
      state.loginError = true;
    },
    logout_success(state) {
      state.loginSuccess = false;
      state = defaultState();
    },
    update_user(state, payload) {
      state = Object.assign(state, payload);
    },
    increment_avatar_key(state) {
      state.avatarKey += 1;
    },
  },
  actions: {
    checkSession({ commit }) {
      return new Promise((resolve, reject) => {
        // var token = VueCookies.get("authomatic");
        const session = cookies.get('session');
        // if (token !== null) console.log("token", token);
        if (session !== null) {
          api
            .whoAmI()
            .then((response) => {
              commit('login_success', {});
              commit('update_user', response.data);
              resolve();
            })
            .catch((error) => {
              console.log(error);
              reject();
            });
        } else {
          resolve();
        }
      });
    },
    logout({ commit }, { user }) {
      return new Promise((resolve, reject) => {
        console.log(`logging out user: ${user}`);
        api
          .logout()
          .then((response) => {
            console.log(response);
            commit('logout_success');
          })
          .catch((error) => {
            console.log(error);
          });
        cookies.remove('session');
        cookies.remove('remember_token');
        commit('logout_success');
        resolve({ status: 'disconnected' });
      });
    },
  },
};
