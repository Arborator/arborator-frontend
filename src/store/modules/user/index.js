import api from "boot/backend-api";

import defaultState from "./defaultState";

// import { Notify } from "quasar";
import VueCookies from "vue-cookies";

export default {
  namespaced: true,
  state: defaultState(),

  getters: {
    getUserInfos: state => state,
    isLoggedIn: state => state.loginSuccess,
    hasLoginErrored: state => state.loginError,
    getFailedAccess: state => state.failedAccess,
    getAvatarKey: state => state.avatarKey,
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
      return new Promise((resolve, object) => {
        //var token = VueCookies.get("authomatic");
        var session = VueCookies.get("session");
        //if (token != null) console.log("token", token);
        if (session != null) {
          api
            .whoAmI({
              id: session,
            })
            .then((response) => {
              commit("login_success", {});
              commit("update_user", response.data );
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    },
    logout({ commit }, { user }) {
      return new Promise((resolve, reject) => {
        console.log("logging out user: " + user);
        api
          .logout()
          .then((response) => {
            console.log(response);
            commit("logout_success");
          })
          .catch((error) => {
            console.log(error);
          });
        VueCookies.remove("session");
        VueCookies.remove("remember_token");
        commit("logout_success");
        resolve({ status: "disconnected" });
      });
    },
  },
};
