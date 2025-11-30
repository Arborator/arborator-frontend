////////// ARBORATOR /////

//// USER ////
export interface user_t {
  id: string;
  authProvider: string;
  username: string;
  firstName: string;
  familyName: string;
  email: string;
  notShareEmail: boolean;
  pictureUrl: string;
  superAdmin: boolean;
  createdDate: number;
  lastSeen: number;
  canToogleSuperAdmin: boolean;
}

//// PROJECT ////
export interface project_t {
  id: number;
  projectName: string;
  description: string;
  image: string;
  visibility: number;
  blindAnnotationMode: boolean;
  diffMode: boolean;
  diffUserId: string;
  freezed: boolean;
  config: string;
  language: string;
  collaborativeMode: boolean;
}

export interface project_extended_t {
  id: number;
  projectName: string;
  description: string;
  image: string;
  visibility: number;
  blindAnnotationMode: boolean;
  freezed: boolean;
  config: string;
  language: string;
  syncGithub: string;
  owner: string;
  contactOwner: string;
  users: string[];
  ownerAvatarUrl: string;
  admins: string[];
  validators: string[];
  annotators: string[];
  guests: string[];
  numberSentences: number;
  numberSamples: number;
  numberTrees: number;
  numberTokens: number;
  lastAccess: number;
  lastWriteAccess: number;
}

export type shownMeta_t = string[];

export type shownFeatures_t = string[];

export interface annotationFeatures_t {
  META: string[];
  UPOS: string[];
  XPOS: string[];
  FEATS: { name: string; values: string[] }[];
  MISC: { name: string; values: string[] | string }[];
  DEPREL: { name: string; values: string[]; join: string }[];
}

export interface project_access_t {
  admins: string[];
  validators: string[];
  annotators: string[];
  guests: string[];
}

//// SAMPLES
export interface sample_t {
  sampleName: string;
  treesFrom: string[];
  sentences: number;
  numberTrees: number;
  tokens: number;
  blindAnnotationLevel: number;
  treeByUser: { [key: string]: number };
  tags: { [key: string]: number };
}

//// GREW
export interface matche_t {
  edges: { [key: string]: string };
  nodes: { [key: string]: string };
}

export interface package_t {
  modified_edges: { src: string; edge: string; tar: string }[];
  modified_nodes: { id: string; features: string[] }[];
}

export type conlls_t = { [userId: string]: string };
export type matches_t = { [userId: string]: matche_t[] };
export type packages_t = { [userId: string]: package_t };

export interface grewSearchResultSentence_t {
  sentence: string;
  conlls: conlls_t;
  sent_id: string;
  matches: matches_t | undefined;
  packages: packages_t | undefined;
  sample_name?: string;
}
export interface grewSearchResultSample_t {
  [sentenceId: string]: grewSearchResultSentence_t;
}
export interface grewSearchResult_t {
  [sampleId: string]: grewSearchResultSample_t;
}

//// CONSTRUCTICON ////

export interface ConstructiconEntry_t {
  id: string;
  title: string;
  description: string;
  grewQuery: string;
  tags: string[];
}

//// LEXICON ////
export interface lexiconItem_t {
  feats: { [key: string]: any };
  freq: number;
}

export ////////// KLANG /////

//// PROJECT ////
interface KlangProject_t {
  name: string;
  nrSamples: number;
  config: { private: boolean };
}

type token = string;
type time_start_ms = string;
type time_end_ms = string;

export type timed_tokens_t = [token, time_start_ms, time_end_ms][][];
////////// KLANG /////
export interface transcription_t {
  accent: string;
  monodia: string;
  sound: string;
  story: string;
  title: string;
  user: string;
  transcription: Array<Array<string>>;
}

///////// PARSER /////////
export interface ModelInfo_t {
  project_name: string;
  model_id: string;
}

interface DataDescription_T {
  n_train_sents: number;
  n_test_sents: number;
  n_train_batches: number;
  n_test_batches: number;
}
interface TrainingDiagnostics_t {
  data_description: DataDescription_T;
  epoch: number;
  saved: boolean;
  is_best_loss: boolean;
  is_best_LAS: boolean;
  epochs_without_improvement: number;
  stopping_early: boolean;
}
interface ScoresOneEpoch_t {
  LAS_epoch: number;
  LAS_chuliu_epoch: number;
  acc_head_epoch: number;
  acc_deprel_epoch: number;
  acc_uposs_epoch: number;
  acc_xposs_epoch: number;
  acc_feats_epoch: number;
  acc_lemma_scripts_epoch: number;
  loss_head_epoch: number;
  loss_deprel_epoch: number;
  loss_xposs_epoch: number;
  loss_feats_epoch: number;
  loss_lemma_scripts_epoch: number;
  loss_epoch: number;
  data_description: TrainingDiagnostics_t | null;
  training_diagnostics: TrainingDiagnostics_t;
}

export type ScoresBest_t = ScoresOneEpoch_t;

export type ScoresHistory_t = ScoresOneEpoch_t[];

export interface ParsingSettings_t {
  keep_heads: 'NONE' | 'EXISTING';
  keep_upos: 'NONE' | 'EXISTING';
  keep_feats: 'NONE' | 'EXISTING';
  keep_xpos: 'NONE' | 'EXISTING';
  keep_deprels: 'NONE' | 'EXISTING';
  keep_lemmas: 'NONE' | 'EXISTING';
}

//////////////Github ///////////////////
export interface githubRepository_t {
  name: string;
  owner_name: string;
  owner_avatar: string;
}
export interface githubSynchronizedRepository_t {
  repositoryName: string;
  branch: string;
}

////////////////GrewHistory //////////////////

export interface grewHistoryRecord_t {
  uuid: string;
  request: string;
  type: string;
  favorite: boolean;
  date: number;
  modifiedSentences: number;
}

////////////////Project stat/////////////
export interface statProject_t {
  users: string[],
  samplesNumber: number,
  treesNumber: number,
  tokensNumber: number,
  sentencesNumber: number,
  topUser: topUser_t,
  lastRead: lastRead_t,
  lastWrite: lastWrite_t,
}
export interface topUser_t {
  username: string,
  treesNumber: number,
  userAvatar: string,
}
export interface lastRead_t {
  lastRead: number,
  lastReadUsername: string,
}
export interface lastWrite_t {
  lastWrite: number,
  lastWriteUsername: string,
}