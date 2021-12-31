import { API } from './axios-api';
import { project_t, project_with_diff_t, transcription_t } from 'src/types/main_types';
import { updateProjectFeatures_ED, updateTree_ED } from './backend-api-types';

export default {
  // -------------------------------------------------- //
  // ---------------        AUTH       ---------------- //
  // -------------------------------------------------- //
  auth(provider: string) {
    // return fetch('http://127.0.0.1:5000/login/'+provider, { mode: 'cors', method: 'GET',
    //     //body: new URLSearchParams(data).toString(),
    //     headers: {'Accept': 'application/json', 'Content-Type': "application/x-www-form-urlencoded" }
    // }).then((res) => res.json())
    return API.get(provider);
  },
  logout() {
    return API.get('/logout');
  },

  // -------------------------------------------------- //
  // ---------------        User       --------------- //
  // -------------------------------------------------- //

  getUsers() {
    return API.get('users/');
  },
  whoAmI() {
    return API.get('users/me');
  },

  // ---------------------------------------------------- //
  // ---------------        Project       --------------- //
  // ---------------------------------------------------- //
  getProjects() {
    return API.get('projects');
  },
  createProject(data: project_t) {
    return API.post('projects/', data);
  },
  getProject(projectname: string) {
    return API.get<project_t>(`projects/${projectname}`);
  },
  updateProject(projectname: string, data: project_with_diff_t) {
    return API.put<project_with_diff_t>(`projects/${projectname}`, data);
  },
  deleteProject(projectname: string) {
    return API.delete(`projects/${projectname}`);
  },
  getProjectFeatures(projectname: string) {
    return API.get(`projects/${projectname}/features`);
  },
  updateProjectFeatures(projectname: string, toUpdateObject: updateProjectFeatures_ED) {
    return API.put(`projects/${projectname}/features`, toUpdateObject);
  },
  getProjectConlluSchema(projectname: string) {
    return API.get(`projects/${projectname}/conll-schema`);
  },
  updateProjectConlluSchema(projectname: string, conlluSchema: any) {
    return API.put(`projects/${projectname}/conll-schema`, conlluSchema);
  },
  getProjectUsersAccess(projectname: string) {
    return API.get(`projects/${projectname}/access`);
  },
  updateManyProjectUserAccess(projectname: string, targetrole: string, userIds: string[]) {
    const data = { user_ids: userIds, targetrole };
    return API.put(`projects/${projectname}/access/many`, data);
  },
  deleteProjectUserAccess(projectname: string, userId: string) {
    return API.delete(`projects/${projectname}/access/${userId}`);
  },

  // ---------------------------------------------------- //
  // ---------------        Samples       --------------- //
  // ---------------------------------------------------- //
  getProjectSamples(projectname: string) {
    // this call flask api that call grew api
    return API.get(`/projects/${projectname}/samples`);
  },
  uploadSample(projectname: string, data: any) {
    return API.post(`/projects/${projectname}/samples`, data, { timeout: 400000 });
  },
  exportEvaluation(projectName: string, sampleName: string) {
    return API.get(`/projects/${projectName}/samples/${sampleName}/evaluation`);
  },
  exportSamplesZip(samplenames: string[], projectname: string) {
    const data = { samples: samplenames };
    return API.post(`/projects/${projectname}/samples/export`, data, {
      responseType: 'arraybuffer',
    });
  },
  deleteSample(projectname: string, samplename: string) {
    return API.delete(`/projects/${projectname}/samples/${samplename}`);
  },
  modifySampleRole(projectname: string, samplename: string, username: string, targetrole: string, action: string) {
    return API.post(`/projects/${projectname}/samples/${samplename}/role`, {
      username,
      targetrole,
      action,
    });
  },
  updateSampleExerciseLevel(projectname: string, samplename: string, exerciseLevel: number) {
    return API.post(`/projects/${projectname}/samples/${samplename}/exercise-level`, { exerciseLevel });
  },

  // ---------------------------------------------------- //
  // ---------------         Trees        --------------- //
  // ---------------------------------------------------- //
  getSampleTrees(projectname: string, samplename: string) {
    return API.get(`/projects/${projectname}/samples/${samplename}/trees`);
  },
  updateTree(projectname: string, samplename: string, data: updateTree_ED) {
    return API.post(`/projects/${projectname}/samples/${samplename}/trees`, data);
  },

  // ----------------------------------------------------- //
  // ---------------          Grew         --------------- //
  // ----------------------------------------------------- //
  getLexicon(projectname: string, data: any) {
    return API.post(`projects/V2/${projectname}/lexicon`, data);
  },
  searchProject(projectname: string, query: any) {
    return API.post(`projects/${projectname}/search`, query);
  },
  tryRuleProject(projectname: string, query: any) {
    return API.post(`projects/${projectname}/try-rule`, query);
  },
  tryRulesProject(projectname: string, query: any) {
    return API.post(`projects/${projectname}/try-rules`, query);
  },
  searchSample(projectname: string, samplename: string, query: any) {
    return API.post(`projects/${projectname}/sample/${samplename}/search`, query);
  },
  // -------------------------------------------------------- //
  // ---------------          Lexicon         --------------- //
  // -------------------------------------------------------- //
  getRelationTable(projectname: string, data: any) {
    return API.post(`projects/${projectname}/relation-table`, data);
  },

  exportLexiconJSON(projectname: string, data: any) {
    return API.post(`projects/${projectname}/export/json`, data, {
      responseType: 'arraybuffer',
    });
  },
  exportLexiconTSV(projectname: string, data: any) {
    return API.post(`projects/${projectname}/export/tsv`, data, {
      responseType: 'arraybuffer',
    });
  },
  transformation_grew(projectname: string, data: any) {
    return API.post(`projects/${projectname}/transformationgrew`, data);
  },
  uploadValidator(projectname: string, data: any) {
    return API.post(`projects/${projectname}/upload/validator`, data);
  },
  addValidator(projectname: string, data: any) {
    return API.post(`projects/${projectname}/addvalidator`, data);
  },
  saveConll(projectname: string, data: any) {
    return API.post(`/projects/${projectname}/saveConll`, data);
  },

  // -------------------------------------------------------- //
  // ---------------        For Klang       --------------- //
  // -------------------------------------------------------- //
  getKlangProjects() {
    return API.get('klang/projects');
  },

  getKlangProjectAdmins(projectname: string) {
    return API.get(`klang/projects/${projectname}/admins`);
  },

  setKlangProjectAdmins(projectname: string, admins: string[]) {
    return API.post(`klang/projects/${projectname}/admins`, { admins });
  },

  getKlangProjectSamples(projectname: string) {
    return API.get(`klang/projects/${projectname}/samples`);
  },

  getOriginalTranscription(projectname: string, samplename: string) {
    return API.get(`klang/projects/${projectname}/samples/${samplename}/timed-tokens`);
  },

  getTranscription(projectname: string, samplename: string, username: string) {
    return API.get<transcription_t>(`klang/projects/${projectname}/samples/${samplename}/transcription/${username}`);
  },

  getAllTranscription(projectname: string, samplename: string) {
    return API.get<transcription_t[]>(`klang/projects/${projectname}/samples/${samplename}/transcriptions`);
  },

  saveTranscription(projectname: string, samplename: string, username: string, data: transcription_t) {
    return API.put(`klang/projects/${projectname}/samples/${samplename}/transcription/${username}`, data);
  },
  // -------------------------------------------------------- //
  // ---------------        To Refactor       --------------- //
  // -------------------------------------------------------- //

  getUsersTreeFrom(projectname: string) {
    return API.get(`projects/${projectname}/treesfrom`);
  },
  addDefaultUserTree(projectname: string, user: string) {
    const data = { user: JSON.stringify(user) };
    return API.post(`projects/${projectname}/defaultusertrees/add`, data);
  },
  removeDefaultUserTree(projectname: string, dutid: any) {
    const data = { dut_id: dutid };
    return API.post(`projects/${projectname}/defaultusertrees/remove`, data);
  },
  uploadProjectImage(projectname: string, form: any) {
    return API.post(`projects/${projectname}/image`, form);
  },
};
