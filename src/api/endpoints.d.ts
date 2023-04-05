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
  grewSearchResult_t as grewSearchResult_t,
  lexiconItem_t, ModelInfo_t, ScoresHistory_t, ScoresBest_t,
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

//// GREW
export type grewSearch_RV = grewSearchResult_t;

//// LEXICON
export type getLexicon_RV = lexiconItem_t[];

/////////////// KLANG //////////:
export interface getOriginalTranscription_RV {
  tokens: timed_tokens_t;
  speakers: string[];
}


////////// PARSER /////////////
interface parser_generic_RV_failure {
  status: "failure";
  error: string;
}

interface parserList_RV_success {
  status: "success";
  data: {
    model_info: ModelInfo_t;
    scores_best: ScoresBest_t;
    scores_history: ScoresHistory_t;
  }[]
}
export type parserList_RV = parser_generic_RV_failure | parserList_RV_success


interface parserTrainStatus_RV_success {
  status: "success";
  data: {
    ready: false;
    scores_best: ScoresBest_t | null;
    scores_history: ScoresHistory_t | null;
  } |
    {
      ready: true;
      model_info: ModelInfo_t;
      scores_best: ScoresBest_t;
      scores_history: ScoresHistory_t;
    }
}

export type parserTrainStatus_RV = parser_generic_RV_failure | parserTrainStatus_RV_success


interface parserParseStatus_RV_success {
  status: "success";
  data: {
    ready: false;
  } |
    {
      ready: true;
      model_info: ModelInfo_t;
    }
}


export type parserParseStatus_RV = parser_generic_RV_failure | parserParseStatus_RV_success
