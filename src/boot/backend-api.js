import axios from 'axios';
axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
import VueCookies from 'vue-cookies';
VueCookies.config('7d');

const API = axios.create({
    baseURL: `/api`,
    timeout: 50000
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
    getProjectSettings(name){
        return API.get('projects/'+name+'/settings/infos');
    },
    setProjectUserRole(projectname, targetrole, userid){
        let data = {'user_id':userid};
        return API.post('projects/'+projectname+'/'+targetrole+'/add', data);
    },
    removeProjectUserRole(projectname, targetrole, userid){
        let data = {'user_id':userid};
        return API.post('projects/'+projectname+'/'+targetrole+'/remove', data);
    },
    getSampleContent(projectname, samplename){
        return API.get('projects/'+projectname+'/sample/'+samplename);
    },
    deleteProject(projectname){
        return API.delete('projects/'+projectname+'/delete');
    },
    deleteSample(projectname, samplename){
        return API.delete('projects/'+projectname+'/sample/'+samplename);
    },
    uploadSample(projectname, data){
        return API.post('projects/' + projectname +'/upload', data);
    },
    addSampleAnnotator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/sample/annotator/add', data);
    },
    removeSampleAnnotator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/sample/annotator/remove', data);
    },
    addSampleValidator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/sample/validator/add', data);
    },
    removeSampleValidator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/sample/validator/remove', data);
    },
    addSampleSuperValidator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/sample/supervalidator/add', data);
    },
    removeSampleSuperValidator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/sample/supervalidator/remove', data);
    },
    addSampleProf(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/sample/prof/add', data);
    },
    removeSampleProf(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/sample/prof/remove', data);
    },
    exportSamplesZip(samplenames, projectname){
        let data = { 'samples': samplenames };
        return API.post('projects/'+projectname+'/export/zip', data, {responseType: 'arraybuffer'});
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
    createProject(data){
        return API.post('projects/create', data)
    },
    createInitializedProject( projectName, data ){
        return API.post('projects/'+projectName+'/create/upload', data);
    },
    searchProject( projectname, query){
        return API.post('projects/'+projectname+'/search', query);
    },
    searchSample( projectname, samplename, query) {
        return API.post('projects/'+projectname+'/sample/'+samplename+'/search', query)
    },
    saveTrees(projectname, samplename, data) {
        return API.post('projects/' + projectname + '/sample/' + samplename+ '/saveTrees', data);
    },
    getRelationTable(projectname) {
        return API.get('projects/' + projectname + '/relation_table/current_user');
    }

}