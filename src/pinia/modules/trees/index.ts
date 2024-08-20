import { sentenceConllToJson, sentenceJson_T } from 'conllup/lib/conll';
import { defineStore } from 'pinia';
import { grewSearchResultSentence_t } from 'src/api/backend-types';
import { notifyError } from 'src/utils/notify';

import api from '../../../api/backend-api';
import { useTagsStore } from '../tags';

export const useTreesStore = defineStore('trees', {
  state: () => {
    return {
      trees: {} as { [key: string]: grewSearchResultSentence_t },
      filteredTrees: [] as grewSearchResultSentence_t[],
      loading: false as boolean,
      blindAnnotationLevel: 0 as number,
      sortedSentIds: [] as string[],
      textFilter: '' as string,
      usersToHaveTree: [] as string[],
      usersToNotHaveTree: [] as string[],
      usersToHaveDiffs: [] as string[],
      usersToNotHaveDiffs: [] as string[],
      featuresSetForDiffs: [] as string[],
      featuresSetForNotDiffs: [] as string[],
      selectedTags: [] as string[],
      reloadTrees: false as boolean,
      pendingModifications: new Map(), 
    };
  },
  getters: {
    numberOfTrees(state) {
      return Object.keys(state.trees).length;
    },
    numberOfTreesPerUser(state) {
      const counter: { [key: string]: number } = {};
      const treesConlls = state.filteredTrees.map((sentence) => sentence.conlls);
      for (const user of this.userIds) {
        counter[user] = treesConlls.filter((conll) => user in conll).length;
      }
      return counter;
    },
    userIds(): string[] {
      const userIds = new Set<string>();
      for (const treeObj of Object.values(this.trees)) {
        for (const userId in treeObj.conlls) {
          userIds.add(userId);
        }
      }
      return [...userIds];
    },
  },
  actions: {
    addPendingModification(sentId: string, conll: string, sampleName: string) {
      this.pendingModifications.set(sentId, { conll: conll, sampleName: sampleName});
    },
    removePendingModification(pendingModification: any) {
      this.pendingModifications.delete(pendingModification);
    },
    emptyPendingModification() {
      this.pendingModifications.clear();
    },
    getSampleTrees({ projectName, sampleName }: { projectName: string; sampleName: string }) {
      return new Promise((resolve, reject) => {
        this.loading = true;
        api
          .getSampleTrees(projectName, sampleName)
          .then((response) => {
            this.trees = response.data.sample_trees;
            this.blindAnnotationLevel = response.data.blind_annotation_level;
            this.sortedSentIds = response.data.sent_ids;
            this.applyFilterTrees();
            this.loading = false;
            resolve(JSON.parse(JSON.stringify(Object.values(this.trees))));
          })
          .catch((error) => {
            notifyError({ error });
            this.loading = false;
            reject(error);
          });
      });
    },
    getUsersTags() {
      const userIds = new Set();
      for (const treeObj of Object.values(this.trees)) {
        for (const userId in treeObj.conlls) {
          if (userId !== 'validated') userIds.add(userId);
        }
      }
      for (const username of userIds) {
        useTagsStore().getUserTags(username as string);
      }
    },
    orderFilteredTrees(order: string) {
      if (order === 'descending') {
        this.filteredTrees = this.filteredTrees.sort((a, b) => b.sentence.length - a.sentence.length);
      }
      else if (order === 'ascending') {
        this.filteredTrees = this.filteredTrees.sort((a, b) => a.sentence.length - b.sentence.length);
      }
      else {
        this.applyFilterTrees();
      }
    },
    applyFilterTrees() {
      this.filteredTrees = this.sortedSentIds.map(
        (sentId) => Object.values(this.trees).find((tree) => tree.sent_id == sentId) as grewSearchResultSentence_t
      );
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
          return sentencesHaveDiffs(
            usersToHaveDiffsThatHaveTrees.map((user) => tree.conlls[user]),
            this.featuresSetForDiffs
          );
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
          return !sentencesHaveDiffs(
            usersToNotHaveDiffsThatHaveTrees.map((user) => tree.conlls[user]),
            this.featuresSetForNotDiffs
          );
        });
      }
      if (this.selectedTags.length > 0) {
        this.filteredTrees = this.filteredTrees.filter((tree) => {
          const userIds = Object.keys(tree.conlls);
          for (const userId of userIds) {
            const treeTags = sentenceConllToJson(tree.conlls[userId]).metaJson.tags as string;
            if (treeTags) {
              if (this.selectedTags.some((tag) => treeTags.includes(tag))) {
                return tree;
              }
            }
          }
        });
      }
    },
  },
});

const sentencesHaveDiffs = (sentenceConlls: string[], featuresSetForDiffs: string[] = []): boolean => {
  const sentenceJsons: sentenceJson_T[] = sentenceConlls.map((conll) => sentenceConllToJson(conll));
  if (haveDifferentNumberOfTokens(sentenceJsons)) {
    return true;
  }
  if (doNeedCheckFor('LEMMA', featuresSetForDiffs) && haveDifferentTokensLEMMA(sentenceJsons)) {
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
    if (feature.startsWith('FEATS.') && haveDifferentTokensFEAT(sentenceJsons, feature.slice('FEATS.'.length))) {
      return true;
    }
    if (feature.startsWith('MISC.') && haveDifferentTokensMISC(sentenceJsons, feature.slice('MISC.'.length))) {
      return true;
    }
  }

  return false;
};

const doNeedCheckFor = (feature: string, featuresSetForDiffs: string[]): boolean => {
  if (featuresSetForDiffs.length === 0) {
    return true;
  }
  return featuresSetForDiffs.includes(feature);
};
const haveDifferentNumberOfTokens = (sentenceJsons: sentenceJson_T[]): boolean => {
  const numberOfTokensArray = sentenceJsons.map((sentenceJson) => Object.keys(sentenceJson.treeJson.nodesJson).length);
  const setOfNumberOfTokens = new Set(numberOfTokensArray);
  return setOfNumberOfTokens.size !== 1;
};

const haveDifferentTokensLEMMA = (sentenceJsons: sentenceJson_T[]): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) =>
    Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.LEMMA)
  );
  for (const index of Array.from(Array(tokensArrays[0].length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false;
};

const haveDifferentTokensUPOS = (sentenceJsons: sentenceJson_T[]): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) =>
    Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.UPOS)
  );
  for (const index of Array.from(Array(tokensArrays[0].length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false;
};

const haveDifferentTokensXPOS = (sentenceJsons: sentenceJson_T[]): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) =>
    Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.XPOS)
  );
  for (const index of Array.from(Array(tokensArrays[0].length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false;
};

const haveDifferentTokensDEPREL = (sentenceJsons: sentenceJson_T[]): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) =>
    Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.DEPREL)
  );
  for (const index of Array.from(Array(tokensArrays[0].length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false;
};

const haveDifferentTokensHEAD = (sentenceJsons: sentenceJson_T[]): boolean => {
  const tokensArrays: number[][] = sentenceJsons.map((sentenceJson) =>
    Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.HEAD)
  );
  for (const index of Array.from(Array(tokensArrays[0].length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: number[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false;
};

const haveDifferentTokensFEAT = (sentenceJsons: sentenceJson_T[], feature: string): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) =>
    Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.FEATS[feature])
  );
  for (const index of Array.from(Array(tokensArrays[0].length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false;
};

const haveDifferentTokensMISC = (sentenceJsons: sentenceJson_T[], feature: string): boolean => {
  const tokensArrays: string[][] = sentenceJsons.map((sentenceJson) =>
    Object.values(sentenceJson.treeJson.nodesJson).map((nodeJson) => nodeJson.MISC[feature])
  );
  for (const index of Array.from(Array(tokensArrays[0].length).keys())) {
    if (new Set(tokensArrays.map((tokensArray: string[]) => tokensArray[index])).size !== 1) {
      return true;
    }
  }
  return false;
};
