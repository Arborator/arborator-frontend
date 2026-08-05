import { defineStore } from 'pinia';

type StagingInfo = {
  by: string;
  at: string;
  status: 'staged' | 'pushed';
  pushedBy?: string;
  pushedAt?: string;
};

export const useGithubStore = defineStore('GithubStore', {
  state: () => {
    return {
      reloadCommits: 0,
      stagedTrees: {} as { [key: string]: StagingInfo },
    };
  },
  actions: {
    replaceSampleStagingStatus(sentIds: string[], stagingStatus: {
      [sentId: string]: {
        [userId: string]: {
          status?: 'staged' | 'pushed';
          staged_by: string;
          staged_at: string;
          pushed_by?: string;
          pushed_at?: string;
        };
      };
    }) {
      for (const key of Object.keys(this.stagedTrees)) {
        if (sentIds.some((sentId) => key.startsWith(`${sentId}_`))) {
          delete this.stagedTrees[key];
        }
      }

      for (const [sentId, userStagingInfo] of Object.entries(stagingStatus)) {
        for (const [userId, info] of Object.entries(userStagingInfo)) {
          const key = `${sentId}_${userId}`;
          this.stagedTrees[key] = {
            by: info.staged_by,
            at: info.staged_at,
            status: info.status || 'staged',
            pushedBy: info.pushed_by,
            pushedAt: info.pushed_at,
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
      this.stagedTrees[key] = { by, at, status: 'staged' };
    },

    markTreesAsPushed(entries: Array<{ sent_id: string; tree_user_id: string }>, pushedBy: string, pushedAt: string) {
      for (const entry of entries) {
        for (const [key, value] of Object.entries(this.stagedTrees)) {
          if (key.startsWith(`${entry.sent_id}_`) && value.status === 'pushed' && key !== `${entry.sent_id}_${entry.tree_user_id}`) {
            delete this.stagedTrees[key];
          }
        }

        const key = `${entry.sent_id}_${entry.tree_user_id}`;
        const current = this.stagedTrees[key];
        if (!current) {
          continue;
        }
        this.stagedTrees[key] = {
          ...current,
          status: 'pushed',
          pushedBy,
          pushedAt,
        };
      }
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
