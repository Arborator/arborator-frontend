import Vue from 'vue'
import Vuex from 'vuex'
import api from '../boot/backend-api'

import config from './modules/config'
import user from './modules/user'
import grewSearch from './modules/grewSearch'
import sample from './modules/sample'

Vue.use(Vuex);

import VueCookies from 'vue-cookies';
VueCookies.config('7d');
Vue.use(VueCookies);

import { Notify } from 'quasar'

import { i18n } from 'src/boot/i18n'


export default new Vuex.Store({
    state: {
        // source: "https://127.0.0.1:5000",
        // source: "https://arboratorgrew.elizia.net:8888",
        source: process.env.API,
        lastGrewQuery: '',
        lastGrewCommand: '',
        pendingModifications: new Set(), // set of sentence ids
    },
    mutations: {
        // seems to be not use
        change_source(state, payload){
            state.source = payload;
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
        changeDesiredUrl({commit}, {value}) {
            state.desiredUrl = payload.value;
            commit('desiredurl_modified', {value: value});
        },
        changePendingModifications({commit}, {value}) {
            commit('change_pending_modifications', {value: value});
        },
        // seems to be not used 
        accessFailed({commit}, {value}) {
            commit('access_failed');
        },
        // seems to be not used 
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
        getLastGrewQuery: state => state.lastGrewQuery,
        getLastGrewCommand: state => state.lastGrewCommand,
        getPendingModifications: state => state.pendingModifications,
    },
    modules: {
        config,
        sample,
        user,
        grewSearch,
    }
})