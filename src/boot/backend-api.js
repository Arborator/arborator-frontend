import axios from 'axios';
axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
import VueCookies from 'vue-cookies';
VueCookies.config('7d');

const API = axios.create({
    // baseURL: 'https://arborapi.ilpga.fr:8888/api',
    // baseURL: `/api`,
    baseURL: ( process.env.DEV ) ? "/api"  : process.env.API+"/api",
    timeout: 50000,
    withCredentials: true
});

const AUTH = axios.create({
    // baseURL: 'https://arborapi.ilpga.fr:8888/login',
    // baseURL: process.env.API + `/login`,
    baseURL: ( process.env.DEV ) ? "/login"  : process.env.API+"/login",
    timeout: 5000,
    withCredentials: true
});

export default {
    getProjects(){
        return API.get('home/projects');
    },
    getUsers(){
        return API.get('admin/users');
    },
    getUsersTreeFrom(projectname){
        return API.get('projects/'+projectname+'/treesfrom');
    },
    getProjectInfos(name){ // this one is slow, asks grew
        return API.get('projects/'+name);
    },
    getProjectSettings(name){ // this one is fast, only flask, also some more information, such as is_open
        return API.get('projects/'+name+'/settings/infos');
    },
    addProjectCatLabel(projectname, cat){
        return API.post('projects/'+projectname+'/config/cat/add', {'cat': cat});
    },
    removeProjectCatLabel(projectname, cat){
        return API.post('projects/'+projectname+'/config/cat/delete', {'cat': cat});
    },
    addProjectStock(projectname){
        return API.post('projects/'+projectname+'/config/stock/add', {'stockid':'dummy'});
    },
    removeProjectStock(projectname, stockid){
        return API.post('projects/'+projectname+'/config/stock/delete', {'stockid':stockid})
    },
    addProjectStockLabel(projectname, stockid, label){
        return API.post('projects/'+projectname+'/config/label/add', {'stockid':stockid, 'label':label});
    },
    removeProjectStockLabel(projectname, id, stockid, label){
        return API.post('projects/'+projectname+'/config/label/delete', {'labelid': id,'stockid':stockid, 'label':label});
    },
    saveTxtCats(projectname, txtCats){
        let data = {'cats':txtCats};
        return API.post('projects/'+projectname+'/config/txtcats', data);
    },
    saveTxtLabels(projectname, txtLabels){
        let data = {'labels':txtLabels};
        return API.post('projects/'+projectname+'/config/txtlabels', data);
    },
    setProjectUserRole(projectname, targetrole, userid){
        let data = {'user_id':userid};
        return API.post('projects/'+projectname+'/'+targetrole+'/add', data);
    },
    removeProjectUserRole(projectname, targetrole, userid){
        let data = {'user_id':userid};
        return API.post('projects/'+projectname+'/'+targetrole+'/remove', data);
    },
    addDefaultUserTree(projectname, user){
        let data = {'user':JSON.stringify(user)};
        return API.post('projects/'+projectname+'/defaultusertrees/add', data);
    },
    removeDefaultUserTree(projectname, dutid){
        let data = {'dut_id':dutid};
        return API.post('projects/'+projectname+'/defaultusertrees/remove', data);
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
        console.log(data);
        return API.post('projects/' + projectname +'/upload', data);
    },
    addSampleAnnotator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/'+projectname+'/sample/annotator/add', data);
    },
    removeSampleAnnotator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/'+projectname+'/sample/annotator/remove', data);
    },
    addSampleValidator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/'+projectname+'/sample/validator/add', data);
    },
    removeSampleValidator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/'+projectname+'/sample/validator/remove', data);
    },
    addSampleSuperValidator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/'+projectname+'/sample/supervalidator/add', data);
    },
    removeSampleSuperValidator(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/'+projectname+'/sample/supervalidator/remove', data);
    },
    addSampleProf(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/'+projectname+'/sample/prof/add', data);
    },
    removeSampleProf(username, projectname, samplename){
        let data = {'username':username, 'projectname':projectname, 'samplename':samplename};
        return API.post('projects/'+projectname+'/sample/prof/remove', data);
    },
    modifyOpenProject(projectname, value){
        return API.post('projects/'+projectname+'/openproject', {'value':value});
    },
    modifyShowAllTrees(projectname, value){
        return API.post('projects/'+projectname+'/showalltrees', {'value':value});
    },
    modifyPrivate(projectname, value){
        return API.post('projects/'+projectname+'/private', {'value':value});
    },
    modifyDescription(projectname, value){
        return API.post('projects/'+projectname+'/description', {'value':value});
    },
    uploadProjectImage(projectname, form){
        return API.post('projects/'+projectname+'/image', form);
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
    getRelationTable(projectname, data) {
        return API.post('projects/' + projectname + '/relation_table', data);
    },
    commit(projectname, data) {
        return API.post('projects/' + projectname + '/commit', data);
    },
    pull(projectname, samplename) {
        return API.get('projects/' + projectname + '/sample/' + samplename + '/pull');
    }

}