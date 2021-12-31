////// ARBORATOR /////

// PROJECT
export interface project_t {
  id: number;
  projectName: string;
  description: string;
  image: string;
  visibility: number;
  showAllTrees: boolean;
  exerciseMode: boolean;
}

export interface project_with_diff_t extends project_t {
  diffMode: boolean;
  diffUserId: string;
}

////// KLANG /////
export interface transcription_t {
  accent: string;
  monodia: string;
  sound: string;
  story: string;
  title: string;
  user: string;
  transcription: Array<Array<string>>;
}
