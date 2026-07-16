import { defineStore } from 'pinia';

export const useGithubStore = defineStore('GithubStore', {
  state: () => {
    return {
      reloadCommits: 0,
      stagedTrees: {} as { [key: string]: { by: string; at: string } },
    };
  },
  actions: {
    updateFromStagingStatus(stagingStatus: {
      [sentId: string]: {
        [userId: string]: { staged_by: string; staged_at: string };
      };
    }) {
      for (const [sentId, userStagingInfo] of Object.entries(stagingStatus)) {
        for (const [userId, info] of Object.entries(userStagingInfo)) {
          const key = `${sentId}_${userId}`;
          this.stagedTrees[key] = {
            by: info.staged_by,
            at: info.staged_at,
          };
        }
      }
    },

    isStaged(sentId: string, userId: string): boolean {
      const key = `${sentId}_${userId}`;
      return key in this.stagedTrees;
    },

    getStagingInfo(sentId: string, userId: string) {
      const key = `${sentId}_${userId}`;
      return this.stagedTrees[key];
    },

    setStagingInfo(
      sentId: string,
      userId: string,
      by: string,
      at: string
    ) {
      const key = `${sentId}_${userId}`;
      this.stagedTrees[key] = { by, at };
    },

    clearStaging(sentId: string, userId: string) {
      const key = `${sentId}_${userId}`;
      delete this.stagedTrees[key];
    },

    clearAllStaging() {
      this.stagedTrees = {};
    },
  },
});
