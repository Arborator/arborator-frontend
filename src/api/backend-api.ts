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
  grewSearch_RV,
  updateManyProjectUserAccess_RV,
  updateProjectConlluSchema_ED,
  updateProjectFeatures_ED,
  updateProject_ED,
  updateProject_RV,
  updateTree_ED,
  whoIAm_RV,
  updateUser_ED,
  getLexicon_RV, parserList_RV_success, parserList_RV, parserTrainStatus_RV, parserParseStatus_RV,
  getGithubRepositories_RV,
 getGithubSynchronizedRepository_RV, getConstructiconEntries_RV, saveConstructiconEntry_RV,
} from './endpoints';
import {
  transcription_t,
  ModelInfo_t,
  ParsingSettings_t, ConstructiconEntry_t
} from './backend-types';

export const API = axios.create({
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
  updateManyProjectUserAccess(projectname: string, data: any) {
    return API.put<updateManyProjectUserAccess_RV>(`projects/${projectname}/access/many`, data);
  },
  deleteProjectUserAccess(projectname: string, username: string) {
    return API.delete(`projects/${projectname}/access/${username}`);
  },

  // ---------------------------------------------------- //
  // ---------------        Samples       --------------- //
  // ---------------------------------------------------- //
  getProjectSamples(projectname: string) {
    return API.get<getProjectSamples_RV>(`/projects/${projectname}/samples`);
  },
  uploadSample(projectname: string, data: any) {
    return API.post<{ status: 'OK' }>(`/projects/${projectname}/samples`, data, { timeout: 400000 });
  },
  tokenizeSample(projectName: string, data: any) {
    return API.post(`/projects/${projectName}/samples/tokenize`, data, { timeout: 400000 });
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
  exportSamplesZip(projectname: string, data: any) {
    return API.post(`/projects/${projectname}/samples/export`, data, {
      responseType: 'arraybuffer',
    });
  },
  deleteSample(projectname: string, samplename: string) {
    return API.delete(`/projects/${projectname}/samples/${samplename}`);
  },
  updateSampleBlindAnnotationLevel(projectname: string, samplename: string, blindAnnotationLevel: number) {
    return API.post(`/projects/${projectname}/samples/${samplename}/blind-annotation-level`, { blindAnnotationLevel });
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
  showDiffsInProject(projectName: string, data: any) {
    return API.post<grewSearch_RV>(`projects/${projectName}/show-diff`, data)
  },
  // -------------------------------------------------------- //
  // ---------------       Constructicon      --------------- //
  // -------------------------------------------------------- //
  getConstructiconEntries(projectname: string) {
    return API.get<getConstructiconEntries_RV>(`constructicon/project/${projectname}`);
  },
  saveConstructiconEntry(projectname: string, data: ConstructiconEntry_t) {
    return API.post<saveConstructiconEntry_RV>(`constructicon/project/${projectname}`, data);
  },
  deleteConstructiconEntry(projectname: string, entryId: string) {
    return API.delete(`constructicon/project/${projectname}/${entryId}`);
  },
  generateURLforConstructiconUpload(projectname: string) {
    return `${API.defaults.baseURL}/constructicon/project/${projectname}/upload-entire-constructicon`
  },
  // -------------------------------------------------------- //
  // ---------------          Lexicon         --------------- //
  // -------------------------------------------------------- //
  getLexicon(projectname: string, data: any) {
    return API.post<getLexicon_RV>(`projects/${projectname}/lexicon`, data);
  },
  exportLexiconJSON(projectname: string, data: any) {
    return API.post(`projects/${projectname}/lexicon/export-json`, data, {
      responseType: 'arraybuffer',
    });
  },
  exportLexiconTSV(projectname: string, data: any) {
    return API.post(`projects/${projectname}/lexicon/export-tsv`, data, {
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
  // ---------------------------------------------------- //
  // ---------------         Parser        --------------- //
  // ---------------------------------------------------- //
  parserList() {
    return API.get<parserList_RV>(`/parser/list`);
  },
  parserTrainStart(projectname: string, trainSampleNames: string[], trainUser: string, maxEpoch: number, baseModel: ModelInfo_t | null) {
    const data = {
      project_name: projectname,
      train_samples_names: trainSampleNames,
      train_user: trainUser,
      max_epoch: maxEpoch,
      base_model: baseModel,
    }
    return API.post(`/parser/train/start`, data);
  },
  parserTrainStatus(modelInfo: ModelInfo_t, trainTaskId: string) {
    const data = {
      model_info: modelInfo,
      train_task_id: trainTaskId,
    }
    return API.post<parserTrainStatus_RV>(`/parser/train/status`, data)
  },
  parserParseStart(projectName: string, modelInfo: ModelInfo_t, toParseSamplesNames: string[], parsingUser: string, parsingSettings: ParsingSettings_t) {
    const data = {
      project_name: projectName,
      model_info: modelInfo,
      to_parse_samples_names: toParseSamplesNames,
      parsing_settings: parsingSettings,
      parsing_user: parsingUser,
    }
    return API.post(`/parser/parse/start`, data)
  },
  parserParseStatus(projectName: string, modelInfo: ModelInfo_t, parseTaskId: string, parserSuffix: string) {
    const data = {
      project_name: projectName,
      model_info: modelInfo,
      parse_task_id: parseTaskId,
      parser_suffix: parserSuffix,
    }
    return API.post<parserParseStatus_RV>(`/parser/parse/status`, data)
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
    return API.post(`/projects/${projectName}/${username}/synchronize-github`, data, { timeout: 4000000 });
  },
  getSynchronizedGithubRepository(projectName: string, username: string) {
    return API.get<getGithubSynchronizedRepository_RV>(`/projects/${projectName}/${username}/synchronize-github`);
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
  addTags(projectName: string, sampleName: string, data: any){
    return API.post(`/projects/${projectName}/samples/${sampleName}/tags`, data);
  },
  removeTag(projectName: string, sampleName: string, data: any){
    return API.put(`/projects/${projectName}/samples/${sampleName}/tags`, data);
  },
  createUserTags(projectName: string, username: string, data: any){
    return API.post(`/projects/${projectName}/tags/${username}`, data);
  },
  getUserTags(projectName: string, username: string){
    return API.get(`/projects/${projectName}/tags/${username}`);
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
