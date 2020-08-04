import Vue from 'vue'
import Vuex from 'vuex'
import api from '../boot/backend-api'

import config from './modules/config'

Vue.use(Vuex);

import VueCookies from 'vue-cookies';
VueCookies.config('7d');
Vue.use(VueCookies);

import { Notify } from 'quasar'

import { i18n } from 'src/boot/i18n'


export default new Vuex.Store({
    state: {
        // source: "https://127.0.0.1:5000",
        // source: "https://arboratorgrew.ilpga.fr:8888",
        source: process.env.API,
        loginSuccess: false,
        loginError: false,
        user: {as_json: null, auth_provider: null, created_date: null, family_name: null, first_name: null, get_id: null, get_or_create: null, id: null, is_active: false, is_anonymous: true, is_authenticated: false, 
            last_seen: null, make_unique_nickname: null, make_valid_nickname: null, picture_url: null, query: null, query_class: null, super_admin: false, username: null},
        failedAccess: false,
        avatarKey: 0, 
        lastGrewQuery: '',
        lastGrewCommand: '',
        pendingModifications: new Set(), // set of sentence ids
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
            state.user = {as_json: null, auth_provider: null, created_date: null, family_name: null, first_name: null, get_id: null, get_or_create: null, id: null, is_active: false, is_anonymous: true, is_authenticated: false, 
                last_seen: null, make_unique_nickname: null, make_valid_nickname: null, picture_url: null, query: null, query_class: null, super_admin: false, username: null};
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
        change_last_grew_command(state, payload){
            state.lastGrewCommand = payload;
        },
        add_pending_modification(state, payload){
            state.pendingModifications.add(payload);
        },
        remove_pending_modification(state, payload){
            state.pendingModifications.delete(payload);
        },
        empty_pending_modification(state){
            state.pendingModifications.clear();
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
                api.logout().then(response => {
                    console.log(response);
                    commit('logout_success');
                }).catch(error => { console.log(error);});
                VueCookies.remove('session'); VueCookies.remove('remember_token');
                commit('logout_success');
                resolve({status: 'disconnected'});
            });
        },
        changeDesiredUrl({commit}, {value}) {
            state.desiredUrl = payload.value;
            commit('desiredurl_modified', {value: value});
        },
        changePendingModifications({commit}, {value}) {
            commit('change_pending_modifications', {value: value});
        },
        accessFailed({commit}, {value}) {
            commit('access_failed');
        },
        updateUser({commit}, {user}) {
            commit('update_user', { user: user });
        },
        notifyError({commit}, {error}){
            var msg;
            var caption="";
            if(error.message!=undefined) 
                {msg = error.message;}
            else if (error.response) {
                if(error.response.status == 403){ msg = (error.response.message)?error.response.message:i18n.t('error403');  }
                else if(error.response.status == 401){ msg == (error.response.message)?error.response.message:i18n.t('error401');}
                else { msg =(error.response.message)?error.response.message: error.response.statusText + ' error ' + error.response.status; }
            }
            else msg='oops'+error;
            if (error.caption) caption=error.caption;
            if (error.permanent) Notify.create({message: msg, position: 'top-right', color: 'negative', icon:'warning', caption:caption, timeout:0, closeBtn:'Dismiss', html:true});
            else Notify.create({message: msg, position: 'top-right', color: 'negative', icon:'warning', caption:caption});
        },
    },
    getters: {
        getSource: state => state.source,
        isLoggedIn: state => state.loginSuccess,
        hasLoginErrored: state => state.loginError,
        getFailedAccess: state => state.failedAccess,
        getUserInfos: state => state.user,
        getAvatarKey: state => state.avatarKey,
        getLastGrewQuery: state => state.lastGrewQuery,
        getLastGrewCommand: state => state.lastGrewCommand,
        getPendingModifications: state => state.pendingModifications,
    },
    modules: {
        config,
    }
})