import axios from 'axios';

import { ConstructiconEntry_t, ModelInfo_t, ParsingSettings_t, transcription_t } from './backend-types';
import {
  createProject_ED,
  getConstructiconEntries_RV,
  getGithubRepositories_RV,
  getGithubSynchronizedRepository_RV,
  getGrewHistory_RV,
  getLexicon_RV,
  getOriginalTranscription_RV,
  getProjectConlluSchema_RV,
  getProjectFeatures_RV,
  getProjectSamples_RV,
  getProjectUsersAccess_RV,
  getProject_RV,
  getProjects_RV,
  getUsers_RV,
  grewSearch_RV,
  parserList_RV,
  parserParseStatus_RV,
  parserTrainStatus_RV,
  saveConstructiconEntry_RV,
  updateManyProjectUserAccess_RV,
  updateProjectConlluSchema_ED,
  updateProjectFeatures_ED,
  updateProject_ED,
  updateProject_RV,
  updateTree_ED,
  updateUser_ED,
  whoIAm_RV,
  getStatProject_RV,
} from './endpoints';

export const API = axios.create({
  baseURL: process.env.DEV ? '/api' : `${process.env.API}/api`,
  timeout: 50000,
  withCredentials: false,
});

export default {
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
    return API.put<whoIAm_RV>('users/me', data);
  },
  logout() {
    return API.get('users/logout');
  },

  // ---------------------------------------------------- //
  // ---------------        Project       --------------- //
  // ---------------------------------------------------- //
  getProjects() {
    return API.get<getProjects_RV>('projects');
  },
  getUserProjects() {
    return API.get<getProjects_RV>('projects/user-projects');
  },
  getMismatchProjects() {
    return API.get('projects/mismatch-projects');
  },
  createProject(data: createProject_ED) {
    return API.post('projects/', data);
  },
  getProject(projectName: string) {
    return API.get<getProject_RV>(`projects/${projectName}`);
  },
  updateProject(projectName: string, data: updateProject_ED) {
    return API.put<updateProject_RV>(`projects/${projectName}`, data);
  },
  deleteProject(projectName: string) {
    return API.delete(`projects/${projectName}`);
  },
  uploadProjectImage(projectName: string, form: any) {
    return API.post(`projects/${projectName}/image`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getProjectImage(projectName: string) {
    return API.get(`projects/${projectName}/image`);
  },
  checkProjectLanguageDetected(projectName: string) {
    return API.get(`projects/${projectName}/language-detected`);
  },
  getProjectFeatures(projectName: string) {
    return API.get<getProjectFeatures_RV>(`projects/${projectName}/features`);
  },
  updateProjectFeatures(projectName: string, toUpdateObject: updateProjectFeatures_ED) {
    return API.put<{ status: 'success' }>(`projects/${projectName}/features`, toUpdateObject);
  },
  getProjectConlluSchema(projectName: string) {
    return API.get<getProjectConlluSchema_RV>(`projects/${projectName}/conll-schema`);
  },
  updateProjectConlluSchema(projectName: string, data: any) {
    return API.put(`projects/${projectName}/conll-schema`, data);
  },
  getProjectUsersAccess(projectName: string) {
    return API.get<getProjectUsersAccess_RV>(`projects/${projectName}/access`);
  },
  updateManyProjectUserAccess(projectName: string, data: any) {
    return API.put<updateManyProjectUserAccess_RV>(`projects/${projectName}/access/many`, data);
  },
  deleteProjectUserAccess(projectName: string, username: string) {
    return API.delete(`projects/${projectName}/access/${username}`);
  },
  // ---------------------------------------------------- //
  // ---------------        Samples       --------------- //
  // ---------------------------------------------------- //
  getProjectSamples(projectName: string) {
    return API.get<getProjectSamples_RV>(`/projects/${projectName}/samples`);
  },
  uploadSample(projectName: string, data: any) {
    return API.post<{ status: 'OK' }>(`/projects/${projectName}/samples`, data, { timeout: 400000 });
  },
  deleteSamples(projectName: string, data: any) {
    return API.patch(`/projects/${projectName}/samples`, data);
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
  exportSamplesZip(projectName: string, data: any) {
    return API.post(`/projects/${projectName}/samples/export`, data, {
      responseType: 'arraybuffer',
    });
  },
  updateSampleBlindAnnotationLevel(projectName: string, samplename: string, blindAnnotationLevel: number) {
    return API.post(`/projects/${projectName}/samples/${samplename}/blind-annotation-level`, { blindAnnotationLevel });
  },

  // ---------------------------------------------------- //
  // ---------------         Trees        --------------- //
  // ---------------------------------------------------- //
  getSampleTrees(projectName: string, samplename: string) {
    return API.get(`/projects/${projectName}/samples/${samplename}/trees`);
  },
  updateTree(projectName: string, samplename: string, data: updateTree_ED) {
    return API.post(`/projects/${projectName}/samples/${samplename}/trees`, data);
  },
  deleteUserTrees(projectName: string, sampleName: string, username: string) {
    return API.delete(`/projects/${projectName}/samples/${sampleName}/trees/${username}`);
  },
  splitTree(projectName: string, sampleName: string, data: any) {
    return API.post(`/projects/${projectName}/samples/${sampleName}/trees/split`, data);
  },
  mergeTrees(projectName: string, sampleName: string, data: any) {
    return API.post(`/projects/${projectName}/samples/${sampleName}/trees/merge`, data);
  },
  saveAllTrees(projectName: string, sampleName: string, data: any) {
    return API.post(`/projects/${projectName}/samples/${sampleName}/trees/all`, data);
  },
  validateAllTrees(projectName: string, sampleName: string) {
    return API.post(`/projects/${projectName}/samples/${sampleName}/validate`);
  },
  validateTree(projectName: string, data: any) {
    return API.post(`/projects/${projectName}/tree/validate`, data);
  },
  // ----------------------------------------------------- //
  // ---------------          Grew         --------------- //
  // ----------------------------------------------------- //
  searchRequest(projectName: string, data: any) {
    return API.post<grewSearch_RV>(`projects/${projectName}/search`, data);
  },
  tryPackage(projectName: string, data: any) {
    return API.post<grewSearch_RV>(`projects/${projectName}/try-package`, data);
  },
  applyRule(projectName: string, data: any) {
    return API.post(`/projects/${projectName}/apply-rule`, data);
  },
  getRelationTable(projectName: string, data: any) {
    return API.post(`projects/${projectName}/relation-table`, data);
  },
  // -------------------------------------------------------- //
  // ---------------       Constructicon      --------------- //
  // -------------------------------------------------------- //
  getConstructiconEntries(projectName: string) {
    return API.get<getConstructiconEntries_RV>(`constructicon/project/${projectName}`);
  },
  saveConstructiconEntry(projectName: string, data: ConstructiconEntry_t) {
    return API.post<saveConstructiconEntry_RV>(`constructicon/project/${projectName}`, data);
  },
  deleteConstructiconEntry(projectName: string, entryId: string) {
    return API.delete(`constructicon/project/${projectName}/${entryId}`);
  },
  generateURLforConstructiconUpload(projectName: string) {
    return `${API.defaults.baseURL}/constructicon/project/${projectName}/upload-entire-constructicon`;
  },
  // -------------------------------------------------------- //
  // ---------------          Lexicon         --------------- //
  // -------------------------------------------------------- //
  getLexicon(projectName: string, data: any) {
    return API.post<getLexicon_RV>(`projects/${projectName}/lexicon`, data);
  },
  exportLexiconJSON(data: any) {
    return API.post(`projects/lexicon/export-json`, data, {
      responseType: 'arraybuffer',
    });
  },
  exportLexiconTSV(data: any) {
    return API.post(`projects/lexicon/export-tsv`, data, {responseType: 'arraybuffer',});
  },
  // -------------------------------------------------------- //
  // ---------------        For Klang       --------------- //
  // -------------------------------------------------------- //
  getKlangProjects() {
    return API.get('klang/projects');
  },

  getKlangProjectAdmins(projectName: string) {
    return API.get<string[]>(`klang/projects/${projectName}/admins`);
  },

  setKlangProjectAdmins(projectName: string, admins: string[]) {
    return API.post(`klang/projects/${projectName}/admins`, { admins });
  },

  getKlangAccessible(projectName: string) {
    return API.get(`klang/projects/${projectName}/accessible`);
  },

  getKlangProjectTranscribers(projectName: string) {
    return API.get(`klang/projects/${projectName}/transcribers`);
  },

  getKlangProjectSamples(projectName: string) {
    return API.get(`klang/projects/${projectName}/samples`);
  },

  getOriginalTranscription(projectName: string, samplename: string) {
    return API.get<getOriginalTranscription_RV>(`klang/projects/${projectName}/samples/${samplename}/timed-tokens`);
  },

  getTranscription(projectName: string, samplename: string, username: string) {
    return API.get<transcription_t>(`klang/projects/${projectName}/samples/${samplename}/transcription/${username}`);
  },

  getAllTranscription(projectName: string, samplename: string) {
    return API.get<transcription_t[]>(`klang/projects/${projectName}/samples/${samplename}/transcriptions`);
  },

  saveTranscription(projectName: string, samplename: string, username: string, data: transcription_t) {
    return API.put<transcription_t>(`klang/projects/${projectName}/samples/${samplename}/transcription/${username}`, data);
  },
  // ---------------------------------------------------- //
  // ---------------         Parser        --------------- //
  // ---------------------------------------------------- //
  parserList() {
    return API.get<parserList_RV>(`/parser/list`);
  },
  parserRemove(projectName: string, modelId: string) {
    return API.delete(`parser/list/${projectName}/${modelId}`);
  },
  parserTrainStart(projectName: string, trainSampleNames: string[], trainUser: string, maxEpoch: number, baseModel: ModelInfo_t | null) {
    const data = {
      project_name: projectName,
      train_samples_names: trainSampleNames,
      train_user: trainUser,
      max_epoch: maxEpoch,
      base_model: baseModel,
    };
    return API.post(`/parser/train/start`, data);
  },
  parserTrainStatus(modelInfo: ModelInfo_t, trainTaskId: string) {
    const data = {
      model_info: modelInfo,
      train_task_id: trainTaskId,
    };
    return API.post<parserTrainStatus_RV>(`/parser/train/status`, data);
  },
  parserParseStart(
    projectName: string,
    modelInfo: ModelInfo_t,
    toParseSamplesNames: string[],
    parsingUser: string,
    parsingSettings: ParsingSettings_t
  ) {
    const data = {
      project_name: projectName,
      model_info: modelInfo,
      to_parse_samples_names: toParseSamplesNames,
      parsing_settings: parsingSettings,
      parsing_user: parsingUser,
    };
    return API.post(`/parser/parse/start`, data);
  },
  parserParseStatus(projectName: string, modelInfo: ModelInfo_t, parseTaskId: string, parserSuffix: string) {
    const data = {
      project_name: projectName,
      model_info: modelInfo,
      parse_task_id: parseTaskId,
      parser_suffix: parserSuffix,
    };
    return API.post<parserParseStatus_RV>(`/parser/parse/status`, data);
  },
  // -------------------------------------------------------- //
  // ---------------          Github         --------------- //
  // -------------------------------------------------------- //
  getGithubRepositories() {
    return API.get<getGithubRepositories_RV>(`/projects/github`);
  },
  getGithubRepoBranches(repoName: string) {
    return API.get(`/projects/github/branch?full_name=${repoName}`);
  },
  synchronizeWithGithubRepo(projectName: string, data: any) {
    return API.post(`/projects/${projectName}/synchronize`, data, { timeout: 4000000 });
  },
  getSynchronizedGithubRepository(projectName: string) {
    return API.get<getGithubSynchronizedRepository_RV>(`/projects/${projectName}/synchronize`);
  },
  deleteSynchronization(projectName: string) {
    return API.delete(`/projects/${projectName}/synchronize`);
  },
  getChanges(projectName: string) {
    return API.get(`/projects/${projectName}/synchronize/commit`);
  },
  commitChanges(projectName: string, data: any) {
    return API.post(`/projects/${projectName}/synchronize/commit`, data);
  },
  checkPull(projectName: string) {
    return API.get(`/projects/${projectName}/synchronize/pull`);
  },
  pullChanges(projectName: string) {
    return API.post(`/projects/${projectName}/synchronize/pull`);
  },
  deleteFileFromGithub(projectName: string, data: any) {
    return API.patch(`/projects/${projectName}/synchronize/files`, data);
  },
  openPullRequest(projectName: string, data: any) {
    return API.post(`/projects/${projectName}/synchronize/pull-request`, data);
  },
  // -------------------------------------------------------- //
  // ---------------       Tags              --------------- //
  // -------------------------------------------------------- //
  addTags(projectName: string, sampleName: string, data: any) {
    return API.post(`/projects/${projectName}/samples/${sampleName}/tags`, data);
  },
  removeTag(projectName: string, sampleName: string, data: any) {
    return API.put(`/projects/${projectName}/samples/${sampleName}/tags`, data);
  },
  createUserTags(projectName: string, username: string, data: any) {
    return API.post(`/projects/${projectName}/${username}/tags`, data);
  },
  getUserTags(projectName: string, username: string) {
    return API.get(`/projects/${projectName}/${username}/tags`);
  },
  deleteUserTag(projectName: string, username: string, tag: string) {
    return API.delete(`/projects/${projectName}/${username}/tags/${tag}`);
  },
  // -------------------------------------------------------- //
  // ---------------       grewHistory        --------------- //
  // -------------------------------------------------------- //
  getGrewHistory(projectName: string) {
    return API.get<getGrewHistory_RV>(`projects/${projectName}/history`);
  },
  saveGrewRequest(projectName: string, data: any) {
    return API.post(`projects/${projectName}/history`, data);
  },
  deleteAllHistory(projectName: string) {
    return API.delete(`projects/${projectName}/history`);
  },
  deleteHistoryRecord(projectName: string, recordId: string) {
    return API.delete(`projects/${projectName}/history/${recordId}`);
  },
  updateHistoryRecord(projectName: string, recordId: string, data: any) {
    return API.put(`projects/${projectName}/history/${recordId}`, data);
  },
  // -------------------------------------------------------- //
  // ---------------       ProjectStats        --------------- //
  // -------------------------------------------------------- //
  getStats(projectName: string) {
    return API.get<getStatProject_RV>(`projects/${projectName}/statistics`);
  },
};
