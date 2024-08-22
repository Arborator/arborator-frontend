import { defineStore } from 'pinia';
import { grewHistoryRecord_t } from 'src/api/backend-types';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { v4 as uuidv4 } from 'uuid';

import api from '../../../api/backend-api';
import { useProjectStore } from '../project';

export const useGrewHistoryStore = defineStore('grewHistory', {
  state: () => {
    return {
      grewHistory: [] as grewHistoryRecord_t[],
    };
  },
  getters: {
    searchHistory(state) {
      return state.grewHistory.filter((record) => record.type === 'search');
    },
    rewriteHistory(state) {
      return state.grewHistory.filter((record) => record.type === 'rewrite');
    },
    favoriteHistory(state) {
      return state.grewHistory.filter((record) => record.favorite);
    },
  },
  actions: {
    getHistory() {
      api
        .getGrewHistory(useProjectStore().name)
        .then((response) => {
          this.grewHistory = response.data.reverse();
        })
        .catch(() => {
          notifyError({ error: 'Error happend while getting the history' });
        });
    },
    saveHistory(historyRecord: any) {
      const data = {
        uuid: uuidv4(),
        request: historyRecord.request,
        type: historyRecord.type === 'search' ? 'search' : 'rewrite',
        favorite: false,
        date: Date.now(),
        modifiedSentences: historyRecord.type === 'rewrite' ? historyRecord.modifiedSentences : 0,
      };
      api
        .saveGrewRequest(useProjectStore().name, data)
        .then(() => {
          console.log('Grew request saved in the backend');
        })
        .catch(() => {
          notifyError({ error: 'Error happened while saving the history' });
        });
    },
    updateHistory(recordId: string, changes: any) {
      api
        .updateHistoryRecord(useProjectStore().name, recordId, changes)
        .then(() => {
          notifyMessage({ message: 'History favorites are updated' });
        })
        .catch(() => {
          notifyError({ error: 'Error happened while updating history favorites' });
        });
    },
    deleteHistoryItem(recordId: string) {
      api
        .deleteHistoryRecord(useProjectStore().name, recordId)
        .catch(() => {
          notifyError({ error: 'Error happened while deleting history item' });
        });
    },
    deleteAllHistory() {
      api
        .deleteAllHistory(useProjectStore().name)
        .then(() => {
          notifyMessage({ message: 'Grew History is successfully deleted' });
        })
        .catch(() => {
          notifyError({ error: 'Error happened while deleting grew history' });
        });
    },
  },
});
