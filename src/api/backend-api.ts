import axios from 'axios';

import {
  createProject_ED,
  getOriginalTranscription_RV,
  getProjectConlluSchema_RV,
  getProjectFeatures_RV,
  getProjectSamples_RV,
  getProjects_RV,
  getProjectUsersAccess_RV,
  getProject_RV,
  getUsers_RV,
  logout_RV,
  modifySampleRole_RV,
  grewSearch_RV,
  updateManyProjectUserAccess_ED,
  updateManyProjectUserAccess_RV,
  updateProjectConlluSchema_ED,
  updateProjectFeatures_ED,
  updateProject_ED,
  updateProject_RV,
  updateTree_ED,
  whoIAm_RV,
  updateUser_ED,
  getLexicon_RV,
  getGithubRepositories_RV,
  createGithubSynchronizedRepository_ED,
} from './endpoints';
import { sample_role_action_t, sample_role_targetrole_t, transcription_t } from './backend-types';

export const API = axios.create({
  // baseURL: 'https://arboratorgrew.elizia.net/api',
  // baseURL: `/api`,
  baseURL: process.env.DEV ? '/api' : `${process.env.API}/api`,
  timeout: 50000,
  withCredentials: false,
});

export default {
  // -------------------------------------------------- //
  // ---------------        AUTH       ---------------- //
  // -------------------------------------------------- //
  auth(provider: string) {
    return API.get(provider);
  },
  logout() {
    return API.get<logout_RV>('/logout');
  },

  // -------------------------------------------------- //
  // ---------------        User       --------------- //
  // -------------------------------------------------- //

  getUsers() {
    return API.get<getUsers_RV>('users/');
  },
  whoAmI() {
    return API.get<whoIAm_RV>('users/me');
  },
  updateUser(data: updateUser_ED) {
    return API.put<whoIAm_RV>('users/me', data)
  },

  // ---------------------------------------------------- //
  // ---------------        Project       --------------- //
  // ---------------------------------------------------- //
  getProjects() {
    return API.get<getProjects_RV>('projects');
  },
  createProject(data: createProject_ED) {
    return API.post('projects/', data);
  },
  getProject(projectname: string) {
    return API.get<getProject_RV>(`projects/${projectname}`);
  },
  updateProject(projectname: string, data: updateProject_ED) {
    return API.put<updateProject_RV>(`projects/${projectname}`, data);
  },
  deleteProject(projectname: string) {
    return API.delete(`projects/${projectname}`);
  },
  getProjectFeatures(projectname: string) {
    return API.get<getProjectFeatures_RV>(`projects/${projectname}/features`);
  },
  updateProjectFeatures(projectname: string, toUpdateObject: updateProjectFeatures_ED) {
    return API.put<{ status: 'success' }>(`projects/${projectname}/features`, toUpdateObject);
  },
  getProjectConlluSchema(projectname: string) {
    return API.get<getProjectConlluSchema_RV>(`projects/${projectname}/conll-schema`);
  },
  updateProjectConlluSchema(projectname: string, data: updateProjectConlluSchema_ED) {
    return API.put(`projects/${projectname}/conll-schema`, data);
  },
  getProjectUsersAccess(projectname: string) {
    return API.get<getProjectUsersAccess_RV>(`projects/${projectname}/access`);
  },
  updateManyProjectUserAccess(projectname: string, targetrole: string, userIds: string[]) {
    const data: updateManyProjectUserAccess_ED = { user_ids: userIds, targetrole };
    return API.put<updateManyProjectUserAccess_RV>(`projects/${projectname}/access/many`, data);
  },
  deleteProjectUserAccess(projectname: string, userId: string) {
    return API.delete(`projects/${projectname}/access/${userId}`);
  },

  // ---------------------------------------------------- //
  // ---------------        Samples       --------------- //
  // ---------------------------------------------------- //
  getProjectSamples(projectname: string) {
    // this call flask api that call grew api
    return API.get<getProjectSamples_RV>(`/projects/${projectname}/samples`);
  },
  // KK FIXME : fix this data: any
  uploadSample(projectname: string, data: any) {
    return API.post<{ status: 'OK' }>(`/projects/${projectname}/samples`, data, { timeout: 400000 });
  },
  exportEvaluation(projectName: string, sampleName: string) {
    return API.get(`/projects/${projectName}/samples/${sampleName}/evaluation`, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
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
  modifySampleRole(projectname: string, samplename: string, username: string, targetrole: sample_role_targetrole_t, action: sample_role_action_t) {
    return API.post<modifySampleRole_RV>(`/projects/${projectname}/samples/${samplename}/role`, {
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
  deleteUserTrees(projectName: string, sampleName: string, username: string) {
    return API.delete(`/projects/${projectName}/samples/${sampleName}/trees/${username}`)
  },

  // ----------------------------------------------------- //
  // ---------------          Grew         --------------- //
  // ----------------------------------------------------- //
  searchProject(projectname: string, data: any) {
    return API.post<grewSearch_RV>(`projects/${projectname}/search`, data);
  },
  searchSample(projectname: string, samplename: string, data: any) {
    return API.post<grewSearch_RV>(`projects/${projectname}/sample/${samplename}/search`, data);
  },
  tryPackage(projectname: string, sampleId: string | null, query: any, userType: string) {
    return API.post<grewSearch_RV>(`projects/${projectname}/try-package`, { package: query, userType, sampleId });
  },
  applyRule(projectname: string, data: any){
    return API.post(`/projects/${projectname}/apply-rule`, data);
  },
  getRelationTable(projectname: string, data: any) {
    return API.post(`projects/${projectname}/relation-table`, data);
  },

  // -------------------------------------------------------- //
  // ---------------          Lexicon         --------------- //
  // -------------------------------------------------------- //
  getLexicon(projectname: string, data: any) {
    return API.post<getLexicon_RV>(`projects/V2/${projectname}/lexicon`, data);
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
  // -------------------------------------------------------- //
  // ---------------        For Klang       --------------- //
  // -------------------------------------------------------- //
  getKlangProjects() {
    return API.get('klang/projects');
  },

  getKlangProjectAdmins(projectname: string) {
    return API.get<string[]>(`klang/projects/${projectname}/admins`);
  },

  setKlangProjectAdmins(projectname: string, admins: string[]) {
    return API.post(`klang/projects/${projectname}/admins`, { admins });
  },

  getKlangAccessible(projectname: string) {
    return API.get(`klang/projects/${projectname}/accessible`);
  },

  getKlangProjectTranscribers(projectname: string) {
    return API.get(`klang/projects/${projectname}/transcribers`);
  },

  getKlangProjectSamples(projectname: string) {
    return API.get(`klang/projects/${projectname}/samples`);
  },

  getOriginalTranscription(projectname: string, samplename: string) {
    return API.get<getOriginalTranscription_RV>(`klang/projects/${projectname}/samples/${samplename}/timed-tokens`);
  },

  getTranscription(projectname: string, samplename: string, username: string) {
    return API.get<transcription_t>(`klang/projects/${projectname}/samples/${samplename}/transcription/${username}`);
  },

  getAllTranscription(projectname: string, samplename: string) {
    return API.get<transcription_t[]>(`klang/projects/${projectname}/samples/${samplename}/transcriptions`);
  },

  saveTranscription(projectname: string, samplename: string, username: string, data: transcription_t) {
    return API.put<transcription_t>(`klang/projects/${projectname}/samples/${samplename}/transcription/${username}`, data);
  },
  // write bootparser default fct here:
  // ---------------------------------------------------- //
  // ---------------         Parser        --------------- //
  // ---------------------------------------------------- //
  bootParserDefault(samplenames: string[], projectname: string) {
    const data = { samples: samplenames, dev: 0.1, parser: 'auto', epoch: 5, to_parse: 'ALL' };
    return API.post(`/projects/${projectname}/samples/parsing`, data);
  },
  bootParserCustom(
    samplenames: string[],
    projectname: string,
    parserType: string,
    epochs: number,
    keepUpos: boolean,
    toParseNames: string[] | 'ALL',
    trainingUser: string | 'last'
  ) {
    // TODO add custom parser params button
    const data = {
      samples: samplenames,
      dev: 0.1,
      parser: parserType,
      epoch: epochs,
      keep_upos: keepUpos,
      to_parse: toParseNames,
      training_user: trainingUser,
    };
    return API.post(`/projects/${projectname}/samples/parsing`, data);
  },
  bootParserResults(projectname: string, parserType: string, projectFdname: string) {
    const data = { parser: parserType, fdname: projectFdname };
    return API.post(`/projects/${projectname}/samples/parsing/results`, data);
  },
  removeParseFolder(projectname: string, projectFdname: string) {
    const data = { fdname: projectFdname };
    return API.post(`/projects/${projectname}/samples/parsing/removeFolder`, data);
  },
 // -------------------------------------------------------- //
  // ---------------          Github         --------------- //
  // -------------------------------------------------------- //
  getGithubRepositories(projectName: string, username: string) {
    return API.get<getGithubRepositories_RV>(`/projects/${projectName}/${username}/github`);
  },
  createGithubRepository(projectName: string, username: string, data: any) {
    return API.post(`/projects/${projectName}/${username}/github`, data);
  },
  getGithubRepoBranches(projectName: string, username: string, repoName: string) {
    return API.get(`/projects/${projectName}/${username}/github/branch?full_name=${repoName}`);
  }, 
  synchronizeWithGithubRepo(projectName: string, username: string, data: any) {
    return API.post<createGithubSynchronizedRepository_ED>(`/projects/${projectName}/${username}/synchronize-github`, data, { timeout: 4000000 });
  },
  getSynchronizedGithubRepository(projectName: string, username: string) {
    return API.get(`/projects/${projectName}/${username}/synchronize-github`);
  },
  deleteSynchronization(projectName: string, username: string) {
    return API.delete(`/projects/${projectName}/${username}/synchronize-github`);
  },
  getChanges(projectName: string, username: string) {
    return API.get(`/projects/${projectName}/${username}/synchronize-github/commit`)
  },
  commitChanges(projectName: string, username: string, data:any) {
    return API.post(`/projects/${projectName}/${username}/synchronize-github/commit`, data);
  },
  checkPull(projectName: string, username: string){
    return API.get(`/projects/${projectName}/${username}/synchronize-github/pull`);
  },
  pullChanges(projectName: string, username: string, data: any){
    return API.post(`/projects/${projectName}/${username}/synchronize-github/pull`, data);
  },
  deleteFileFromGithub(projectName: string, username: string, fileName: string){
    return API.delete(`/projects/${projectName}/${username}/synchronize-github/${fileName}`);
  },
  openPullRequest(projectName: string, username: string, data: any){
    return API.post(`/projects/${projectName}/${username}/synchronize-github/pull-request`, data);
  },
  // -------------------------------------------------------- //
  // ---------------        To Refactor       --------------- //
  // -------------------------------------------------------- //

  getUsersTreeFrom(projectname: string) {
    return API.get(`projects/${projectname}/treesfrom`);
  },
  uploadProjectImage(projectname: string, form: any) {
    return API.post(`projects/${projectname}/image`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
