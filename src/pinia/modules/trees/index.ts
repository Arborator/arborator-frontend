import {defineStore} from 'pinia';

import {notifyMessage, notifyError} from 'src/utils/notify';
import api from '../../../api/backend-api';
import {
  grewSearchResultSentence_t,
} from 'src/api/backend-types';


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
      console.log("KK change in filteredTrees", state.textFilter)
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
    selectThisTree(item: grewSearchResultSentence_t) {
      this.selectedTreeId = item.sent_id;
    },
  },
});
