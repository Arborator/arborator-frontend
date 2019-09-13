import axios from 'axios';

const API = axios.create({
    baseURL: `/api`,
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
    }

}

//   /projects
//   home
//   samples
//   adminpanel
//   config par projet