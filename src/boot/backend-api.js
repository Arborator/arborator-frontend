import axios from "axios";
axios.defaults.headers.post["Content-Type"] = "multipart/form-data";
import VueCookies from "vue-cookies";
VueCookies.config("7d");

const API = axios.create({
  // baseURL: 'https://arboratorgrew.ilpga.fr:8888/api',
  // baseURL: `/api`,
  baseURL: process.env.DEV ? "/api" : process.env.API + "/api",
  timeout: 50000,
  withCredentials: true,
});

// const AUTH = axios.create({
//   // baseURL: 'https://arboratorgrew.ilpga.fr:8888/login',
//   // baseURL: process.env.API + `/login`,
//   baseURL: process.env.DEV ? "/api" : process.env.API + "/api",
//   timeout: 5000,
//   withCredentials: true,
// });

export default {
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
    // return API.get("projects/fetch_all");
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
    console.log("KK projectname, conlluSchema", conlluSchema)
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
  // getProjectInfos(projectname) {
  //   // this one is slow, asks grew
  //   return API.get("projects/" + projectname);
  // },
  // deleteProject(projectname) {
  //   return API.delete("projects/" + projectname + "/delete");
  // },

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

  // -----------        Settings       ----------- //

  getProjectSettings(projectname) {
    // this one is fast, only flask, also some more information, such as is_open
    // return API.get("projects/" + projectname + "/settings/infos");
    return API.get("projects/" + projectname + "/settings/fetch");
  },
  // updateProjectSettings(projectname, projectSettings) {
  //   // new from kim JSON.stringify(user)
  //   return API.post(
  //     "projects/" + projectname + "/settings/update",
  //     projectSettings
  //   );
  // },
  // getProjectConlluSchema(projectname) {
  //   return API.get("projects/" + projectname + "/conllu-schema/fetch");
  // },
  // updateProjectConlluSchema(projectname, conlluSchema) {
  //   return API.post(
  //     "projects/" + projectname + "/conllu-schema/update",
  //     conlluSchema
  //   );
  // },

  // -----------        Sample       ----------- //

  getProjectSamples(projectname) {
    // this call flask api that call grew api
    return API.get("projects/" + projectname + "/samples/fetch_all");
  },
  updateSampleExerciseLevel(projectname, samplename, exerciseLevel) {
    const data = { exerciseLevel };
    return API.post(
      `projects/${projectname}/${samplename}/set-exercise-level`,
      data
    );
  },
  getSampleTrees(projectname, samplename) {
    return API.get(
      "projects/" + projectname + "/samples/" + samplename + "/trees/fetch_all"
    );
  },
  deleteSample(projectname, samplename) {
    return API.delete("projects/" + projectname + "/sample/" + samplename);
  },
  uploadSample(projectname, data) {
    console.log(data);
    return API.post("projects/" + projectname + "/upload", data);
  },

  getUsersTreeFrom(projectname) {
    return API.get("projects/" + projectname + "/treesfrom");
  },

  removeProjectUserRole(projectname, targetrole, userid) {
    let data = { user_id: userid };
    return API.post(
      "projects/" + projectname + "/" + targetrole + "/remove",
      data
    );
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

  addSampleAnnotator(username, projectname, samplename) {
    let data = {
      username: username,
      project_name: projectname,
      sample_name: samplename,
    };
    return API.post("projects/" + projectname + "/sample/annotator/add", data);
  },
  removeSampleAnnotator(username, projectname, samplename) {
    let data = {
      username: username,
      project_name: projectname,
      sample_name: samplename,
    };
    return API.post(
      "projects/" + projectname + "/sample/annotator/remove",
      data
    );
  },
  addSampleValidator(username, projectname, samplename) {
    let data = {
      username: username,
      project_name: projectname,
      sample_name: samplename,
    };
    return API.post("projects/" + projectname + "/sample/validator/add", data);
  },
  removeSampleValidator(username, projectname, samplename) {
    let data = {
      username: username,
      project_name: projectname,
      sample_name: samplename,
    };
    return API.post(
      "projects/" + projectname + "/sample/validator/remove",
      data
    );
  },
  addSampleSuperValidator(username, projectname, samplename) {
    let data = {
      username: username,
      project_name: projectname,
      sample_name: samplename,
    };
    return API.post(
      "projects/" + projectname + "/sample/supervalidator/add",
      data
    );
  },
  removeSampleSuperValidator(username, projectname, samplename) {
    let data = {
      username: username,
      project_name: projectname,
      sample_name: samplename,
    };
    return API.post(
      "projects/" + projectname + "/sample/supervalidator/remove",
      data
    );
  },
  addSampleProf(username, projectname, samplename) {
    let data = {
      username: username,
      project_name: projectname,
      sample_name: samplename,
    };
    return API.post("projects/" + projectname + "/sample/prof/add", data);
  },
  removeSampleProf(username, projectname, samplename) {
    let data = {
      username: username,
      project_name: projectname,
      sample_name: samplename,
    };
    return API.post("projects/" + projectname + "/sample/prof/remove", data);
  },

  uploadProjectImage(projectname, form) {
    return API.post("projects/" + projectname + "/image", form);
  },
  exportSamplesZip(samplenames, projectname) {
    let data = { samples: samplenames };
    return API.post("projects/" + projectname + "/export/zip", data, {
      responseType: "arraybuffer",
    });
  },
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

  createInitializedProject(projectName, data) {
    return API.post("projects/" + projectName + "/create/upload", data);
  },
  searchProject(projectname, query) {
    return API.post("projects/" + projectname + "/search", query);
  },
  tryRuleProject(projectname, query) {
    return API.post("projects/" + projectname + "/tryRule", query);
  },
  searchSample(projectname, samplename, query) {
    return API.post(
      "projects/" + projectname + "/sample/" + samplename + "/search",
      query
    );
  },
  saveTrees(projectname, data) {
    return API.post("projects/" + projectname + "/saveTrees", data);
  },
  getRelationTable(projectname, data) {
    return API.post("projects/" + projectname + "/relation_table", data);
  },
  commit(projectname, data) {
    return API.post("projects/" + projectname + "/commit", data);
  },
  pull(projectname, data) {
    return API.post("projects/" + projectname + "/pull", data);
  },
  getLexicon(projectname, data) {
    return API.post("projects/" + projectname + "/getLexicon", data);
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
};
