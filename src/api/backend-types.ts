////////// ARBORATOR /////

//// USER ////
export interface user_t {
  id: string;
  auth_provider: string;
  username: string;
  first_name: string;
  family_name: string;
  email: string;
  not_share_email: boolean;
  picture_url: string;
  super_admin: boolean;
  created_date: number;
  last_seen: number;
}

//// PROJECT ////
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
  freezed: boolean;
}

export interface project_extended_t {
  id: number;
  projectName: string;
  description: string;
  image: string;
  visibility: number;
  showAllTrees: boolean;
  exerciseMode: boolean;
  freezed: boolean;

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

export type shownMeta = string[];

export type shownFeatures = string[];

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
  validators: string[];
  annotators: string[];
  guests: string[];
}

//// SAMPLES
export interface sample_t {
  sample_name: string;
  treesFrom: string[];
  sentences: number;
  number_trees: number;
  tokens: number;
  exerciseLevel: number;
  treeByUser: { [key: string]: number };
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
export type packages_t = { [userId: string]: package_t[] };

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
  id: string,
  title: string,
  description: string,
  grew_query: string,
  tags: string[],

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
		n_sentences_train: number;
		n_sentences_test: number;
		epoch: number;
}

export type ScoresBest_t = ScoresOneEpoch_t

export type ScoresHistory_t = ScoresOneEpoch_t[]

export interface ParsingSettings_t {
  keep_heads: "NONE" | "EXISTING"
}

//////////////Github ///////////////////
export interface githubRepository_t {
  name: String,
  owner_name: String,
  owner_avatar: String,
}
export interface githubSynchronizedRepository_t {
  repositoryName: string,
  branch: string,
}
