import { defineStore } from "pinia";
import { statProject_t } from "src/api/backend-types";
import { notifyError } from "src/utils/notify";

import api from "src/api/backend-api";

export const useStatisticStore = defineStore('stats', {
  state: () => {
    return {
      projectStats: {} as statProject_t,
      topUserProgress: 0 as number,
      topUserProgressLabel: '' as string,
    }
  },
  actions: {
    getStatistics(projectName: string) {
      api
        .getStats(projectName)
        .then((response) => {
          this.projectStats = { ...response.data };
          if (this.projectStats.topUser) {
            this.topUserProgress = this.projectStats.topUser.treesNumber / this.projectStats.sentencesNumber;
            this.topUserProgressLabel = `${(this.projectStats.topUser.treesNumber / this.projectStats.sentencesNumber * 100).toFixed(2)} %`;
          }
        })
        .catch((error) => {
          notifyError({ error, caller: 'getStatistics' });
        })
    }
  }
})