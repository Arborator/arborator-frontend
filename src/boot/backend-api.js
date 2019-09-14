import axios from 'axios';

const API = axios.create({
    baseURL: `/api`,
    timeout: 10000
  });

const AUTH = axios.create({
baseURL: `/login`,
timeout: 10000
});

export default {
    getProjects(){
        return API.get('home/projects');
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
    }

}