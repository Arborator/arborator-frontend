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
        projectConfig: {
            cats: [], 
            labels: [], 
            is_open: false, 
            show_all_trees: true,
            shownfeatures: ["FORM", "UPOS", "LEMMA", "MISC.Gloss"],
            shownmeta: ["text_en"],
            annotationFeatures: {
                "META": [
                    "sent_id", "text", "text_en", "text_ortho", "speaker_id", "sound_url"
                ],
                "UPOS": [
                    "ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "VERB", "X"
                ],
                "XPOS": [],
                "FEATS": [
                    { "name": "Abbr", "values": ["Yes"]},
                    { "name": "Animacy", "values": ["Anim", "Hum ", "Inan ", "Nhum"]},
                    { "name": "Aspect", "values": ["Hab", "Imp", "Iter", "Perf", "Prog", "Prosp"]},
                    { "name": "Case", "values": ["Abs", "Acc", "Erg", "Nom", "Abe", "Ben", "Cau", "Cmp", "Com", "Dat", "Dis", "Equ", "Gen", "Ins", "Par", "Tem", "Tra", "Voc", "Abl", "Add", "Ade", "All", "Del", "Ela", "Ess", "Ill", "Ine", "Lat", "Loc", "Sub", "Sup", "Ter"]},
                    { "name": "Definite", "values": ["Com", "Cons", "Def", "Ind", "Spec"]},
                    { "name": "Degree", "values": ["Abs", "Cmp", "Equ", "Pos", "Sup"]},
                    { "name": "Evident", "values": ["Fh", "Nfh"]},
                    { "name": "Foreign", "values": ["Yes"]},
                    { "name": "Gender", "values": ["Com", "Fem", "Masc", "Neut"]},
                    { "name": "Mood", "values": ["Adm", "Cnd", "Des", "Imp", "Ind", "Jus", "Nec", "Opt", "Pot", "Prp", "Qot", "Sub"]},
                    { "name": "NumType", "values": ["Card", "Dist", "Frac", "Mult", "Ord", "Range", "Sets"]},
                    { "name": "Number", "values": ["Coll", "Count", "Dual", "Grpa", "Grpl", "Inv", "Pauc", "Plur", "Ptan", "Sing", "Tri"]},
                    { "name": "Person", "values": ["0", "1", "2", "3", "4"]},
                    { "name": "Polarity", "values": ["Neg", "Pos"]},
                    { "name": "Polite", "values": ["Elev", "Form", "Humb", "Infm"]},
                    { "name": "Poss", "values": ["Yes"]},
                    { "name": "PronType", "values": ["Art", "Dem", "Emp", "Exc", "Ind", "Int", "Neg", "Prs", "Rcp", "Rel", "Tot"]},
                    { "name": "Reflex", "values": ["Yes"]},
                    { "name": "Tense", "values": ["Fut", "Imp", "Past", "Pqp", "Pres"]},
                    { "name": "VerbForm", "values": ["Conv", "Fin", "Gdv", "Ger", "Inf", "Part", "Sup", "Vnoun"]},
                    { "name": "Voice", "values": ["Act", "Antip", "Cau", "Dir", "Inv", "Mid", "Pass", "Rcp"]}
                ],
                "MISC": [
                    { "name": "AlignBegin", "values": "Number" },
                    { "name": "AlignEnd", "values": "Number" },
                    { "name": "EXTPOS", "values": ["SCONJ"] },
                    { "name": "Gloss", "values": "String" }
                ],
                // "DEPREL": {
                //     "1": ["cc","comp","compound","conj","det","discourse","dislocated","flat","goeswith","mod","parataxis","punct","root","subj","unk","vocative"],
                //     "2": ["appos", "aux", "cleft", "comp", "conj", "coord", "dicto", "discourse", "dislocated", "emph", "expl", "fixed", "foreign", "insert", "num", "obj", "obl", "parenth", "periph", "poss", "pred", "prt", "redup", "relcl", "scrap", "svc"],
                //     "deep": ["agent", "expl", "fixed", "lvc", "num", "relcl", "scrap", "x"]
                // },
                "DEPREL": [
                    {"name": "rel", "values": ["cc","comp","compound","conj","det","discourse","dislocated","flat","goeswith","mod","parataxis","punct","root","subj","unk","vocative"], "join":""},
                    {"name": "subrel", "values": ["","appos", "aux", "cleft", "comp", "conj", "coord", "dicto", "discourse", "dislocated", "emph", "expl", "fixed", "foreign", "insert", "num", "obj", "obl", "parenth", "periph", "poss", "pred", "prt", "redup", "relcl", "scrap", "svc"], "join":":"},
                    {"name": "deep", "values": ["","agent", "expl", "fixed", "lvc", "num", "relcl", "scrap", "x"], "join":"@"}
                ],
                "DEPS": [
                    // "deep": ["comp", "mod", "subj"]
                    {"name": "deep", "values": ["comp", "mod", "subj"], "join":""}

                ]
            }
        }
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

            // state.projectConfig = payload // bad idea as it erases all local information better:
            state.projectConfig = Object.assign(state.projectConfig, payload)
            // state.projectConfig.cats = payload.cats;
            // state.projectConfig.labels = payload.labels;
            // state.projectConfig.is_open = payload.is_open;
            // state.projectConfig.show_all_trees = payload.show_all_trees;

            console.log(1234444444, '// todo save on grew, as soon as api accepts the information', payload);
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
            var msg;
            var caption="";
            if(error.message!=undefined) {msg = error.response.message;}
            else if (error.response) {
                if(error.response.status == 403){ msg = (error.response.message)?error.response.message:`Hey you! You do not have the permissions for this action. Please contact the administrator.`;  }
                else if(error.response.status == 401){ msg == (error.response.message)?error.response.message:`Hey you! Please log in to do any further actions of that type.`;}
                else { msg =(error.response.message)?error.response.message: error.response.statusText + ' error ' + error.response.status; }
            }
            else msg='Something went wrong: '+error;
            if (error.caption) caption=error.caption;
            if (error.permanent) Notify.create({message: msg, position: 'top-right', color: 'negative', icon:'warning', caption:caption, timeout:0, closeBtn:'Dismiss', html:true});
            else Notify.create({message: msg, position: 'top-right', color: 'negative', icon:'warning', caption:caption});
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