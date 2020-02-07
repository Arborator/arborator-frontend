import Vue from 'vue'
import Vuex from 'vuex'
import api from '../boot/backend-api'

Vue.use(Vuex);

import VueCookies from 'vue-cookies';
VueCookies.config('7d');
Vue.use(VueCookies);

import { Notify } from 'quasar'


export default new Vuex.Store({
    state: {
        source: "https://127.0.0.1:5000",
        loginSuccess: false,
        loginError: false,
        user: {as_json: null, auth_provider: null, created_date: null, family_name: null, first_name: null, get_id: null, get_or_create: null, id: null, is_active: false, is_anonymous: true, is_authenticated: false, 
            last_seen: null, make_unique_nickname: null, make_valid_nickname: null, picture_url: null, query: null, query_class: null, super_admin: false, username: null},
        failedAccess: false,
        avatarKey: 0, 
        lastGrewQuery: '',
        projectConfig: {cats: [], labels: [], is_open: false, show_all_trees: true}
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
        },
        change_last_grew_query(state, payload){
            state.lastGrewQuery = payload;
        },
        set_project_config(state, payload){
            state.projectConfig.cats = payload.cats;
            state.projectConfig.labels = payload.labels;
            state.projectConfig.is_open = payload.is_open;
            state.projectConfig.show_all_trees = payload.show_all_trees;
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
        setUser({commit}, {user}){
            // commit('login_success', { userName: user.username});
            commit('update_user', {user: user} );
        },
        checkSession({commit}, {sessionid}){
            return new Promise((resolve, object) => {
                api.whoAmI().then(response => {
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
        },
        notifyError({commit}, {error}){
            console.log(error.response.statusText, error.response.status);
            var msg;
            if(error.response.status == 403){ msg = `You do not have the permissions for this action. Please contact the administrator.`;  }
            else if(error.response.status == 401){ msg == `Please log in to do any further action.`;}
            else { msg = error.response.statusText + ' error ' + error.response.status; }
            Notify.create({message: msg, position: 'top-right', color: 'negative'});
        }

    },
    getters: {
        getSource: state => state.source,
        isLoggedIn: state => state.loginSuccess,
        hasLoginErrored: state => state.loginError,
        getFailedAccess: state => state.failedAccess,
        getUserInfos: state => state.user,
        getAvatarKey: state => state.avatarKey,
        getLastGrewQuery: state => state.lastGrewQuery,
        getProjectConfig: state => state.projectConfig
    }
})