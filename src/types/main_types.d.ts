import { Emitter } from 'mitt';
import { ReactiveSentence } from 'dependencytreejs/src/ReactiveSentence';
import { SentenceSVG } from 'dependencytreejs/src/SentenceSVG';
import { sentenceJson_T, tokenJson_T, treeJson_T } from 'conllup/lib/conll';

//////// UI /////

export interface pagination_t {
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
}

export interface field_t {
  name: string;
  label: string;
  sortable: boolean;
  field: string;
  align?: string;
  // sort?: (a: any, b: any) => number;
}

export interface table_t<T> {
  fields: field_t[];
  selected: T[];
  visibleColumns: string[];
  visibleColumnsBlindAnnotationMode?: string[];
  filter: string;
  loading: boolean;
  pagination: pagination_t;
  loadingDelete: boolean;
  exporting?: boolean;
}

export interface reactive_sentences_obj_t {
  [key: string]: ReactiveSentence;
}

// export type
export type sentence_bus_events_t = {
  'open:metaDialog': { userId: string };
  'open:conlluDialog': { userId: string };
  'open:statisticsDialog': { userId: string };
  'open:openMultiEditDialog': { userId: string };
  'open:relationDialog': { userId: string; dep: tokenJson_T; gov: tokenJson_T };
  'open:featuresDialog': { userId: string; token: tokenJson_T };
  'open:uposDialog': { userId: string; token: tokenJson_T };
  'open:xposDialog': { userId: string; token: tokenJson_T };
  'action:saved': { userId: string };
  'export:SVG': { userId: string };
  'export:PNG': { userId: string };
  'open:tokensReplaceDialog': { userId: string; event: Event };
  'changed:metaText': { newMetaText: string };
  'tree-update:token': { userId: string; token: tokenJson_T };
  'tree-update:sentence': { sentenceJson: sentenceJson_T; userId: string };
  'action:undo': { userId: string };
  'action:redo': { userId: string };
  'action:addEmptyToken': { userId: string };
  'action:tabSelected': { userId: string };
  'tree-update:tree': { userId: string; tree: TreeJson };
  'tree-update:tags': { sentenceJson: SentenceJson; userId: string};
};
export interface sentence_bus_t extends Emitter<sentence_bus_events_t> {
  sentenceSVGs: { [key: string]: SentenceSVG };
}

export type grew_query_t = { name: string; pattern: string; sampleIds: string | string[] | undefined | never[]; type: 'SEARCH' | 'REWRITE' };

export type grew_templates_t = {
  searchQueries: grew_query_t[];
  rewriteQueries: grew_query_t[];
};
