import {defineStore} from 'pinia';

import {notifyMessage, notifyError} from 'src/utils/notify';
import api from '../../../api/backend-api';
import {
  grewSearchResultSentence_t,
} from 'src/api/backend-types';
import {sentenceConllToJson, SentenceJson} from "conllup/lib/conll";


export const useTreesStore = defineStore('trees', {
  state: () => {
    return {
      trees: {} as { [key: string]: grewSearchResultSentence_t },
      selectedTreeId: null as string | null,
      loading: false as boolean,
      exerciseLevel: 0 as number,
      textFilter: '' as string,
      usersToHaveTree: [] as string[],
      usersToNotHaveTree: [] as string[],
      usersToHaveDiffs: [] as string[],
      usersToNotHaveDiffs: [] as string[],
      featuresSetForDiffs: [] as string[],
    };
  },
  getters: {
    selectedTree: (state): grewSearchResultSentence_t | null => {
      if (!state.selectedTreeId || !state.trees[state.selectedTreeId]) {
        return null;
      }
      return state.trees[state.selectedTreeId];
    },
    filteredTrees: (state): grewSearchResultSentence_t[] => {
      let filteredTrees = Object.values(state.trees)
      if (state.textFilter !== '') {
        filteredTrees = Object.values(state.trees).filter((tree) => {
          return tree.sentence.toLowerCase().includes(state.textFilter.toLowerCase());
        }, []);
      }

      if (state.usersToHaveTree.length > 0) {
        filteredTrees = filteredTrees.filter((tree) => {
          const usersIds = Object.keys(tree.conlls);
          return state.usersToHaveTree.every((user) => usersIds.includes(user));
        });
      }

      if (state.usersToNotHaveTree.length > 0) {
        filteredTrees = filteredTrees.filter((tree) => {
          const usersIds = Object.keys(tree.conlls);
          return state.usersToNotHaveTree.every((user) => !usersIds.includes(user));
        });
      }

      if (state.usersToHaveDiffs.length > 0) {
        filteredTrees = filteredTrees.filter((tree) => {
          const usersToHaveDiffsThatHaveTrees = state.usersToHaveDiffs.filter((user) => {
            const usersIds = Object.keys(tree.conlls);
            return usersIds.includes(user);
          });
          if (usersToHaveDiffsThatHaveTrees.length <= 1) {
            return false;
          }
          return sentencesHaveDiffs(usersToHaveDiffsThatHaveTrees.map((user) => tree.conlls[user]), state.featuresSetForDiffs)
        });
      }
      if (state.usersToNotHaveDiffs.length > 0) {
        filteredTrees = filteredTrees.filter((tree) => {
          const usersToNotHaveDiffsThatHaveTrees = state.usersToNotHaveDiffs.filter((user) => {
            const usersIds = Object.keys(tree.conlls);
            return usersIds.includes(user);
          });
          if (usersToNotHaveDiffsThatHaveTrees.length <= 1) {
            return false;
          }
          return !sentencesHaveDiffs(usersToNotHaveDiffsThatHaveTrees.map((user) => tree.conlls[user]), state.featuresSetForDiffs)
        });
      }
      return filteredTrees;
    },
    numberOfTrees(state) {
      return Object.keys(state.trees).length;
    },
  },
  actions: {
    getSampleTrees({projectName, sampleName}: { projectName: string; sampleName: string }) {
      return new Promise((resolve, reject) => {
        this.loading = true;
        api
          .getSampleTrees(projectName, sampleName)
          .then((response) => {
            this.trees = response.data.sample_trees;
            this.exerciseLevel = response.data.exercise_level;
            this.loading = false;
            notifyMessage({message: `Loaded ${Object.keys(this.trees).length} trees`});
            resolve(JSON.parse(JSON.stringify(Object.values(this.trees))));
          })
          .catch((error) => {
            notifyError({error});
            this.loading = false;
            reject(error);
          });
      });
    },
  },
});

const sentencesHaveDiffs = (sentenceConlls: string[], featuresSetForDiffs: string[] = []): boolean => {
  const sentenceJsons: SentenceJson[] = sentenceConlls.map((conll) => sentenceConllToJson(conll));

  if (haveDifferentNumberOfTokens(sentenceJsons)) {
    return true;
  }

  if (doNeedCheckFor('FORM', featuresSetForDiffs) && haveDifferentTokensFORM(sentenceJsons)) {
    return true;
  }

  if (doNeedCheckFor('UPOS', featuresSetForDiffs) && haveDifferentTokensUPOS(sentenceJsons)) {
    return true;
  }

  if (doNeedCheckFor('XPOS', featuresSetForDiffs) && haveDifferentTokensXPOS(sentenceJsons)) {
    return true;
  }

  if (doNeedCheckFor('DEPREL', featuresSetForDiffs) && haveDifferentTokensDEPREL(sentenceJsons)) {
    return true;
  }

  if (doNeedCheckFor('HEAD', featuresSetForDiffs) && haveDifferentTokensHEAD(sentenceJsons)) {
    return true;
  }

  for (const feature of featuresSetForDiffs) {
    if (feature.startsWith('FEATS.') && haveDifferentTokensFEAT(sentenceJsons, feature.slice("FEATS.".length))) {
      return true;
    }
    if (feature.startsWith('MISC.') && haveDifferentTokensMISC(sentenceJsons, feature.slice("MISC.".length))) {
      return true;
    }
  }

  return false;
}

const doNeedCheckFor = (feature: string, featuresSetForDiffs: string[]): boolean => {
  if (featuresSetForDiffs.length === 0) {
    return true;
  }
  return featuresSetForDiffs.includes(feature);
}
const haveDifferentNumberOfTokens = (sentenceJsons: SentenceJson[]): boolean => {
  const numberOfTokensArray = sentenceJsons.map((sentenceJson) => Object.keys(sentenceJson.treeJson.nodesJson).length);
  const setOfNumberOfTokens = new Set(numberOfTokensArray);
  return setOfNumberOfTokens.size !== 1;
}

const haveDifferentTokensFORM = (sentenceJsons: SentenceJson[]): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) => Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.FORM));
  for (const index of Array.from(Array(tokensArrays.length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false
}

const haveDifferentTokensUPOS = (sentenceJsons: SentenceJson[]): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) => Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.UPOS));
  for (const index of Array.from(Array(tokensArrays.length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false
}

const haveDifferentTokensXPOS = (sentenceJsons: SentenceJson[]): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) => Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.XPOS));
  for (const index of Array.from(Array(tokensArrays.length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false
}

const haveDifferentTokensDEPREL = (sentenceJsons: SentenceJson[]): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) => Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.DEPREL));
  for (const index of Array.from(Array(tokensArrays[0].length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false
}

const haveDifferentTokensHEAD = (sentenceJsons: SentenceJson[]): boolean => {
  const tokensArrays: number[][] = sentenceJsons.map((sentenceJson) => Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.HEAD));
  for (const index of Array.from(Array(tokensArrays.length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: number[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false
}

const haveDifferentTokensFEAT = (sentenceJsons: SentenceJson[], feature: string): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) => Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.FEATS[feature]));
  for (const index of Array.from(Array(tokensArrays.length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false
}

const haveDifferentTokensMISC = (sentenceJsons: SentenceJson[], feature: string): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) => Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.MISC[feature]));
  for (const index of Array.from(Array(tokensArrays.length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false
}
