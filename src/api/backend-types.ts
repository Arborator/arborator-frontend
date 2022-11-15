////////// ARBORATOR /////

//// USER ////
export interface user_t {
  id: string;
  auth_provider: number;
  username: string;
  first_name: string;
  family_name: string;
  picture_url: string;
  super_admin: boolean;
  created_date: number;
  last_seen: number;
}

//// PROJECT ////
// export interface project_t {
//   id: number;
//   projectName: string;
//   description: string;
//   image: string;
//   visibility: number;
//   showAllTrees: boolean;
//   exerciseMode: boolean;
// }

export interface project_with_diff_t {
  id: number;
  projectName: string;
  description: string;
  image: string;
  visibility: number;
  showAllTrees: boolean;
  exerciseMode: boolean;
  diffMode: boolean;
  diffUserId: string;
}

export interface project_extended_t {
  id: number;
  projectName: string;
  description: string;
  image: string;
  visibility: number;
  showAllTrees: boolean;
  exerciseMode: boolean;

  admins: string[];
  guests: string[];
  numberSentences: number;
  numberSamples: number;
  numberTrees: number;
  numberTokens: number;
  lastAccess: number;
  lastWriteAccess: number;
}

export type shownmeta = string[];

export type shownfeatures = string[];

export interface annotationFeatures_t {
  META: string[];
  UPOS: string[];
  XPOS: string[];
  FEATS: { name: string; values: string[] }[];
  MISC: { name: string; values: string[] | string }[];
  DEPREL: { name: string; values: string[]; join: string }[];
  DEPS: { name: string; values: string[]; join: string }[];
}

export interface project_access_t {
  admins: string[];
  guests: string[];
}

//// SAMPLES
// this user_sample_roles_t interface is messy , it comes from backend, it should prob change
export interface user_sample_roles_t {
  key: string;
  value: string;
}

export interface sample_roles_t {
  annotator: user_sample_roles_t[];
  validator: user_sample_roles_t[];
}
export interface sample_t {
  sample_name: string;
  treesFrom: string;
  sentences: number;
  number_trees: number;
  tokens: number;
  exerciseLevel: number;
  roles: sample_roles_t;
}

export type sample_role_targetrole_t = 'annotator' | 'validator';
export type sample_role_action_t = 'add' | 'remove';

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
export type packages_t = { [userId: string]: package_t[] };

export interface grewSearchResultSentence_t {
  sentence: string;
  conlls: conlls_t;
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
