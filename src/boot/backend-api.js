import axios from 'axios';

const API = axios.create({
    baseURL: `/api`,
    timeout: 10000
  });

export default {
    getProjects(){
        return API.get('/projects');
    }

}

//   /projects
//   home
//   samples
//   adminpanel
//   config par projet