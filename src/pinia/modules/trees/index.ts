import {defineStore} from 'pinia';

import {notifyMessage, notifyError} from 'src/utils/notify';
import api from '../../../api/backend-api';
import {
  grewSearchResultSentence_t,
} from 'src/api/backend-types';
import {sentenceConllToJson, SentenceJson} from "conllup/lib/conll";
import { useTagsStore } from '../tags';

export const useTreesStore = defineStore('trees', {
  state: () => {
    return {
      trees: {} as { [key: string]: grewSearchResultSentence_t },
      filteredTrees: [] as grewSearchResultSentence_t[],
      loading: false as boolean,
      blindAnnotationLevel: 0 as number,
      textFilter: '' as string,
      usersToHaveTree: [] as string[],
      usersToNotHaveTree: [] as string[],
      usersToHaveDiffs: [] as string[],
      usersToNotHaveDiffs: [] as string[],
      featuresSetForDiffs: [] as string[],
      selectedTags: [] as string[],
    };
  },
  getters: {
    numberOfTrees(state) {
      return Object.keys(state.trees).length;
    },
    userIds() {
      const userIds = new Set();
      for (const treeObj of Object.values(this.trees)) {
          for (const userId in treeObj.conlls) {
              userIds.add(userId);
          }
      }
      return [...userIds];
    }
  },
  actions: {
    getSampleTrees({projectName, sampleName}: { projectName: string; sampleName: string }) {
      return new Promise((resolve, reject) => {
        this.loading = true;
        api
          .getSampleTrees(projectName, sampleName)
          .then((response) => {
            this.trees = response.data.sample_trees;
            this.blindAnnotationLevel = response.data.blind_annotation_level;
            this.applyFilterTrees();
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
    getUsersTags(){
      const userIds = new Set();
      for (const treeObj of Object.values(this.trees)) {
          for (const userId in treeObj.conlls) {
            if(userId !== 'validated') userIds.add(userId);
          }
      }
      for (const username of userIds) {
          useTagsStore().getUserTags(username as string);
      }
    }, 
    applyFilterTrees() {
      this.filteredTrees = Object.values(this.trees)
      if (this.textFilter !== '') {
        this.filteredTrees = Object.values(this.trees).filter((tree) => {
          return tree.sentence.toLowerCase().includes(this.textFilter.toLowerCase());
        }, []);
      }

      if (this.usersToHaveTree.length > 0) {
        this.filteredTrees = this.filteredTrees.filter((tree) => {
          const usersIds = Object.keys(tree.conlls);
          return this.usersToHaveTree.every((user) => usersIds.includes(user));
        });
      }

      if (this.usersToNotHaveTree.length > 0) {
        this.filteredTrees = this.filteredTrees.filter((tree) => {
          const usersIds = Object.keys(tree.conlls);
          return this.usersToNotHaveTree.every((user) => !usersIds.includes(user));
        });
      }

      if (this.usersToHaveDiffs.length > 0) {
        this.filteredTrees = this.filteredTrees.filter((tree) => {
          const usersToHaveDiffsThatHaveTrees = this.usersToHaveDiffs.filter((user) => {
            const usersIds = Object.keys(tree.conlls);
            return usersIds.includes(user);
          });
          if (usersToHaveDiffsThatHaveTrees.length <= 1) {
            return false;
          }
          return sentencesHaveDiffs(usersToHaveDiffsThatHaveTrees.map((user) => tree.conlls[user]), this.featuresSetForDiffs)
        });
      }
      if (this.usersToNotHaveDiffs.length > 0) {
        this.filteredTrees = this.filteredTrees.filter((tree) => {
          const usersToNotHaveDiffsThatHaveTrees = this.usersToNotHaveDiffs.filter((user) => {
            const usersIds = Object.keys(tree.conlls);
            return usersIds.includes(user);
          });
          if (usersToNotHaveDiffsThatHaveTrees.length <= 1) {
            return false;
          }
          return !sentencesHaveDiffs(usersToNotHaveDiffsThatHaveTrees.map((user) => tree.conlls[user]), this.featuresSetForDiffs)
        });
      }
      if(this.selectedTags.length > 0) {
        this.filteredTrees = this.filteredTrees.filter((tree) => {
          const userIds = Object.keys(tree.conlls);
          for(const userId of userIds){
            const treeTags = sentenceConllToJson(tree.conlls[userId]).metaJson.tags as string;
            if (this.selectedTags.some((tag) => treeTags.includes(tag))){
              return tree;
            }
          }
        })
      }
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
