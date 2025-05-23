import {
  ConstructiconEntry_t,
  ModelInfo_t,
  ScoresBest_t,
  ScoresHistory_t,
  annotationFeatures_t,
  githubRepository_t,
  githubSynchronizedRepository_t,
  grewHistoryRecord_t,
  grewSearchResult_t,
  lexiconItem_t,
  project_access_t,
  project_extended_t,
  project_t,
  sample_t,
  shownFeatures_t,
  shownMeta_t,
  timed_tokens_t,
  user_t,
  statProject_t,
} from './backend-types';

export interface logout_RV {
  logout: true;
}

////////////////// User //////////////////////
export type getUsers_RV = user_t[];

export type whoIAm_RV = user_t;

export type updateUser_ED = Partial<user_t>;

/////////////////// Project ///////////////////

export type getProjects_RV = project_extended_t[];

export type createProject_ED = Partial<project_t>;

export type getProject_RV = project_t;

export type updateProject_ED = Partial<project_t>;

export type updateProject_RV = project_t;

export interface getProjectFeatures_RV {
  shownMeta: shownMeta_t;
  shownFeatures: shownFeatures_t;
}

export interface updateProjectFeatures_ED {
  shownFeatures?: shownMeta_t;
  shownMeta?: shownMeta_t;
}

export interface getProjectConlluSchema_RV {
  annotationFeatures: annotationFeatures_t;
}

export interface updateProjectConlluSchema_ED {
  config: annotationFeatures_t;
}

export type getProjectUsersAccess_RV = project_access_t;

export type updateManyProjectUserAccess_RV = project_access_t;

//// SAMPLES
export type getProjectSamples_RV = sample_t[];

//// TREES
export interface updateTree_ED {
  sentId: string;
  userId: string;
  conll: string;
}

//// GREW
export type grewSearch_RV = grewSearchResult_t;

//// LEXICON
export type getLexicon_RV = lexiconItem_t[];

//// CONSTRUCTICON
export type getConstructiconEntries_RV = ConstructiconEntry_t[];
export type saveConstructiconEntry_RV = { success: boolean; message: string };

/////////////// KLANG //////////:
export interface getOriginalTranscription_RV {
  tokens: timed_tokens_t;
  speakers: string[];
}

////////// PARSER /////////////
interface parser_generic_RV_failure {
  status: 'failure';
  error: string;
}

interface parserList_RV_success {
  status: 'success';
  data: {
    model_info: ModelInfo_t;
    language: string;
    admins: string[];
    scores_best: ScoresBest_t;
    scores_history: ScoresHistory_t;
  }[];
}
export type parserList_RV = parser_generic_RV_failure | parserList_RV_success;

interface parserTrainStatus_RV_success {
  status: 'success';
  data:
    | {
        ready: false;
        scores_best: ScoresBest_t | null;
        scores_history: ScoresHistory_t | null;
      }
    | {
        ready: true;
        model_info: ModelInfo_t;
        scores_best: ScoresBest_t;
        scores_history: ScoresHistory_t;
      };
}

export type parserTrainStatus_RV = parser_generic_RV_failure | parserTrainStatus_RV_success;

interface parserParseStatus_RV_success {
  status: 'success';
  data:
    | {
        ready: false;
      }
    | {
        ready: true;
        model_info: ModelInfo_t;
      };
}

export type parserParseStatus_RV = parser_generic_RV_failure | parserParseStatus_RV_success;

//////////// Github //////////
export type getGithubRepositories_RV = githubRepository_t[];

export type getGithubSynchronizedRepository_RV = githubSynchronizedRepository_t;

///////////// GrewHistory ////////////////////
export type getGrewHistory_RV = grewHistoryRecord_t[];

/////////////// statProject ////////////////////

export type getStatProject_RV = statProject_t;