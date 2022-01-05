import {
  annotationFeatures_t,
  project_access_t,
  project_t,
  project_with_diff_t,
  project_extended_t,
  sample_roles_t,
  sample_role_action_t,
  sample_role_targetrole_t,
  sample_t,
  shownfeatures,
  shownmeta,
  user_t,
  timed_tokens_t,
} from './backend-types';

export interface logout_RV {
  logout: true;
}

export type getUsers_RV = user_t[];

export type whoIAm_RV = user_t;

export type getProjects_RV = project_extended_t[];

export type createProject_ED = project_t;

export type getProject_RV = project_with_diff_t;

export type updateProject_ED = Partial<project_with_diff_t>;

export type updateProject_RV = project_with_diff_t;

export interface getProjectFeatures_RV {
  shownmeta: shownmeta;
  shownfeatures: shownfeatures;
}

export interface updateProjectFeatures_ED {
  shownfeatures?: string[];
  shownmeta?: string[];
}

export interface getProjectConlluSchema_RV {
  annotationFeatures: annotationFeatures_t;
}

export interface updateProjectConlluSchema_ED {
  config: annotationFeatures_t;
}

export type getProjectUsersAccess_RV = project_access_t;

export interface updateManyProjectUserAccess_ED {
  user_ids: string[];
  targetrole: string;
}

export type updateManyProjectUserAccess_RV = project_access_t;

//// SAMPLES
export type getProjectSamples_RV = sample_t[];

export interface modifySampleRole_ED {
  username: string;
  targetrole: sample_role_targetrole_t;
  action: sample_role_action_t;
}

export interface modifySampleRole_RV {
  roles: sample_roles_t;
}
//// TREES
export interface updateTree_ED {
  sent_id: string;
  user_id: string;
  conll: string;
}

/////////////// KLANG //////////:
export interface getOriginalTranscription_RV {
  tokens: timed_tokens_t;
  speakers: number[];
}
