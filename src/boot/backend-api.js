import axios from 'axios';
import VueCookies from 'vue-cookies';
VueCookies.config('7d');

const API = axios.create({
    baseURL: `/api`,
    timeout: 10000
});

const AUTH = axios.create({
    baseURL: `/login`,
    timeout: 5000
});

export default {
    getProjects(){
        return API.get('home/projects');
    },
    getUsers(){
        return API.get('admin/users');
    },
    getProjectInfos(name){
        return API.get('projects/'+name);
    },
    getSampleContent(projectname, samplename){
        return API.get('projects/'+projectname+'/sample/'+samplename);
    },
    auth(provider){
        // return fetch('http://127.0.0.1:5000/login/'+provider, { mode: 'cors', method: 'GET', 
        //     //body: new URLSearchParams(data).toString(),
        //     headers: {'Accept': 'application/json', 'Content-Type': "application/x-www-form-urlencoded" }
        // }).then((res) => res.json())
        return AUTH.get(provider);
    },
    logout(){
        return axios.get('/logout');
    },
    whoAmI(){
        var sessionId = VueCookies.get("session");
        var session = {id: sessionId}
        return AUTH.post('userinfos', session);
    },
    search( name, query){
        return API.post('projects/'+name+'/search', query);
    }

}