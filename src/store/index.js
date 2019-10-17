import Vue from 'vue'
import Vuex from 'vuex'
import api from '../boot/backend-api'

Vue.use(Vuex);

import VueCookies from 'vue-cookies';
VueCookies.config('7d');
Vue.use(VueCookies);


export default new Vuex.Store({
    state: {
        source: "https://127.0.0.1:5000",
        loginSuccess: false,
        loginError: false,
        user: {as_json: null, auth_provider: null, created_date: null, family_name: null, first_name: null, get_id: null, get_or_create: null, id: null, is_active: false, is_anonymous: true, is_authenticated: false, 
            last_seen: null, make_unique_nickname: null, make_valid_nickname: null, picture_url: null, query: null, query_class: null, super_admin: false, username: null},
        failedAccess: false,
        avatarKey: 0
    },
    mutations: {
        change_source(state, payload){
            state.source = payload;
        },
        login_success(state, payload){
            state.loginSuccess = true;
        },
        login_error(state, payload){
            state.loginError = true;
        },
        logout_success(state){
            state.loginSuccess = false;
            state.userName = null;
            state.userPass = null;
        },
        access_failed(state, value){
            state.failedAccess = value;
        },
        update_user(state, payload){
            state.user = payload.user;
        },
        increment_avatar_key(state){
            state.avatarKey += 1;
        }
    },
    actions: {
        login({commit}, {user, password}){
            return new Promise((resolve, object) => {
                api.requestAccessToken(user, password)
                    .then(response => {
                        if(response.access_token) {
                            VueCookies.set('axesstoken', response.access_token, response.expires_in, null, null, true);
                            commit('login_success', { userName: user });
                            api.getPersonalInfos(user).then( resp => { 
                                commit('update_user', {user : resp.data} );
                            })
                        }
                        resolve(response);
                    })
                    .catch(error => {
                        console.log("Error: " + error);
                        commit('login_error', {});
                        Promise.reject("Invalid credentials!");
                    })
            });
        },
        checkSession({commit}, {sessionid}){
            return new Promise((resolve, object) => {
                api.whoAmI().then(response => {
                        console.log('WhoAmI?', response);
                        commit('login_success', {});
                        commit('update_user', {user : response.data} );
                    }).catch(error => { console.log(error); });
            });
        },
        logout({commit}, {user}) {
            return new Promise((resolve, reject) => {
                console.log("logging out user: " + user);
                api.logout().then(response => {console.log(response);}).catch(error => { console.log(error);});
                VueCookies.remove('session'); VueCookies.remove('remember_token');
                commit('logout_success');
                resolve({status: 'disconnected'});
            });
        },
        changeDesiredUrl({commit}, {value}) {
            state.desiredUrl = payload.value;
            commit('desiredurl_modified', {value: value});
        },
        accessFailed({commit}, {value}) {
            commit('access_failed');
        },
        updateUser({commit}, {user}) {
            commit('update_user', { user: user });
        }

    },
    getters: {
        getSource: state => state.source,
        isLoggedIn: state => state.loginSuccess,
        hasLoginErrored: state => state.loginError,
        getFailedAccess: state => state.failedAccess,
        getUserInfos: state => state.user,
        getAvatarKey: state => state.avatarKey
    }
})