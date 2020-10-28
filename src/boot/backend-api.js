import axios from "axios";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
import VueCookies from "vue-cookies";
VueCookies.config("7d");


const API = axios.create({
  // baseURL: 'https://arboratorgrew.elizia.net/api',
  // baseURL: `/api`,
  baseURL: process.env.DEV ? "/api" : process.env.API + "/api",
  timeout: 50000,
  withCredentials: true,
});

const AUTH = axios.create({
  // baseURL: 'https://arboratorgrew.elizia.net/login',
  // baseURL: process.env.API + `/login`,
  baseURL: process.env.DEV ? "/api" : process.env.API + "/api",
  timeout: 5000,
  withCredentials: true,
});

export default {
  // -------------------------------------------------- //
  // ---------------        AUTH       ---------------- //
  // -------------------------------------------------- //
  auth(provider) {
    // return fetch('http://127.0.0.1:5000/login/'+provider, { mode: 'cors', method: 'GET',
    //     //body: new URLSearchParams(data).toString(),
    //     headers: {'Accept': 'application/json', 'Content-Type': "application/x-www-form-urlencoded" }
    // }).then((res) => res.json())
    return AUTH.get(provider);
  },
  logout() {
    return axios.get("/logout");
  },

  // -------------------------------------------------- //
  // ---------------        User       --------------- //
  // -------------------------------------------------- //

  getUsers() {
    return API.get("users/");
  },
  whoAmI() {
    return API.get("users/me");
  },

  // ---------------------------------------------------- //
  // ---------------        Project       --------------- //
  // ---------------------------------------------------- //
  getProjects() {
    return API.get("projects");
  },
  createProject(data) {
    return API.post("projects/", data);
  },
  getProject(projectname) {
    return API.get(`projects/${projectname}`);
  },
  updateProject(projectname, data) {
    return API.put(`projects/${projectname}`, data);
  },
  deleteProject(projectname) {
    return API.delete("projects/" + projectname);
  },
  getProjectFeatures(projectname) {
    return API.get(`projects/${projectname}/features`);
  },
  updateProjectFeatures(projectname, toUpdateObject) {
    return API.put(`projects/${projectname}/features`, toUpdateObject);
  },
  getProjectConlluSchema(projectname) {
    return API.get(`projects/${projectname}/conll-schema`);
  },
  updateProjectConlluSchema(projectname, conlluSchema) {
    console.log("KK projectname, conlluSchema", conlluSchema);
    return API.put(`projects/${projectname}/conll-schema`, conlluSchema);
  },
  getProjectUsersAccess(projectname) {
    return API.get(`projects/${projectname}/access`);
  },
  updateManyProjectUserAccess(projectname, targetrole, userIds) {
    let data = { user_ids: userIds, targetrole: targetrole };
    return API.put(`projects/${projectname}/access/many`, data);
  },
  deleteProjectUserAccess(projectname, userId) {
    return API.delete(`projects/${projectname}/access/${userId}`);
  },

  /// --- deprecated ? ----
  modifyOpenProject(projectname, value) {
    return API.post("projects/" + projectname + "/openproject", {
      value: value,
    });
  },
  modifyShowAllTrees(projectname, value) {
    return API.post("projects/" + projectname + "/showalltrees", {
      value: value,
    });
  },
  modifyPrivate(projectname, value) {
    return API.post("projects/" + projectname + "/private", { value: value });
  },
  modifyDescription(projectname, value) {
    return API.post("projects/" + projectname + "/description", {
      value: value,
    });
  },
  /// ---end deprecated ? ----

  // ---------------------------------------------------- //
  // ---------------        Samples       --------------- //
  // ---------------------------------------------------- //
  getProjectSamples(projectname) {
    // this call flask api that call grew api
    return API.get(`/projects/${projectname}/samples`);
  },
  uploadSample(projectname, data) {
    console.log("KK data", data);
    return API.post(`/projects/${projectname}/samples`, data, {test:"to"});
  },
  exportSamplesZip(samplenames, projectname) {
    let data = { samples: samplenames };
    return API.post(`/projects/${projectname}/samples/export`, data, {
      responseType: "arraybuffer",
    });
  },
  deleteSample(projectname, samplename) {
    return API.delete(`/projects/${projectname}/samples/${samplename}`);
  },
  modifySampleRole(projectname, samplename, username, targetrole, action) {
    return API.post(`/projects/${projectname}/samples/${samplename}/role`, {
      username,
      targetrole,
      action,
    });
  },
  updateSampleExerciseLevel(projectname, samplename, exerciseLevel) {
    const data = { exerciseLevel };
    return API.post(
      `/projects/${projectname}/samples/${samplename}/exercise-level`,
      { exerciseLevel }
    );
  },

  // ---------------------------------------------------- //
  // ---------------         Trees        --------------- //
  // ---------------------------------------------------- //
  getSampleTrees(projectname, samplename) {
    return API.get(`/projects/${projectname}/samples/${samplename}/trees`);
  },
  updateTree(projectname, samplename, data) {
    return API.post(
      `/projects/${projectname}/samples/${samplename}/trees`,
      data
    );
  },

  // ----------------------------------------------------- //
  // ---------------          Grew         --------------- //
  // ----------------------------------------------------- //
  getLexicon(projectname, data) {
    return API.post(`projects/${projectname}/lexicon`, data);
  },
  searchProject(projectname, query) {
    return API.post("projects/" + projectname + "/search", query);
  },
  tryRuleProject(projectname, query) {
    return API.post("projects/" + projectname + "/try-rule", query);
  },
  searchSample(projectname, samplename, query) {
    return API.post(
      "projects/" + projectname + "/sample/" + samplename + "/search",
      query
    );
  },
  // -------------------------------------------------------- //
  // ---------------          Lexicon         --------------- //
  // -------------------------------------------------------- //
  getRelationTable(projectname, data) {
    return API.post("projects/" + projectname + "/relation-table", data);
  },

  exportLexiconJSON(projectname, data) {
    return API.post("projects/" + projectname + "/export/json", data, {
      responseType: "arraybuffer",
    });
  },
  exportLexiconTSV(projectname, data) {
    return API.post("projects/" + projectname + "/export/tsv", data, {
      responseType: "arraybuffer",
    });
  },
  transformation_grew(projectname, data) {
    return API.post("projects/" + projectname + "/transformationgrew", data);
  },
  uploadValidator(projectname, data) {
    return API.post("projects/" + projectname + "/upload/validator", data);
  },
  addValidator(projectname, data) {
    return API.post("projects/" + projectname + "/addvalidator", data);
  },
  // -------------------------------------------------------- //
  // ---------------        To Refactor       --------------- //
  // -------------------------------------------------------- //

  getUsersTreeFrom(projectname) {
    return API.get("projects/" + projectname + "/treesfrom");
  },
  addDefaultUserTree(projectname, user) {
    let data = { user: JSON.stringify(user) };
    return API.post("projects/" + projectname + "/defaultusertrees/add", data);
  },
  removeDefaultUserTree(projectname, dutid) {
    let data = { dut_id: dutid };
    return API.post(
      "projects/" + projectname + "/defaultusertrees/remove",
      data
    );
  },
  uploadProjectImage(projectname, form) {
    return API.post("projects/" + projectname + "/image", form);
  },

  // These following two are not used
  commit(projectname, data) {
    return API.post("projects/" + projectname + "/commit", data);
  },
  pull(projectname, data) {
    return API.post("projects/" + projectname + "/pull", data);
  },


};
