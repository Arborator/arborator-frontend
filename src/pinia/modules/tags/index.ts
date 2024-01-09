import api from '../../../api/backend-api';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { defineStore } from 'pinia';
import { useProjectStore } from '../project';
import { sentence_bus_t } from 'src/types/main_types';
import { grewSearchResultSentence_t } from 'src/api/backend-types';

export interface tag_t {
  value: string;
  color: string;
}
export const useTagsStore = defineStore('tags', {
  state: () => {
    const defaultTags: tag_t[] = [
      { value: 'DONE', color: 'green-4' },
      { value: 'IN PROGRESS', color: 'teal-4' },
      { value: 'TODO', color: 'orange-4' },
      { value: 'NEW', color: 'yellow-4' },
      { value: 'ASAP', color: 'deep-orange-4' },
    ];
    return {
      defaultTags,
    };
  },
  actions: {
    getUserTags(username: string) {
      api
        .getUserTags(useProjectStore().name, username)
        .then((response) => {
          if (response.data) {
            for (const tag of response.data) {
              if (!this.defaultTags.map((val) => val.value).includes(tag)) {
                this.defaultTags.push({ value: tag, color: 'gery-4' });
              }
            }
          }
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    removeTag(sentence: grewSearchResultSentence_t, tag: string, sentenceBus: sentence_bus_t, username: string) {
      const data = {
        tag: tag,
        tree: sentenceBus.sentenceSVGs[username].exportConll(),
      };
      const sampleName = sentence.sample_name as string;
      api
        .removeTag(useProjectStore().name, sampleName, data)
        .then((response) => {
          notifyMessage({ message: 'The tag is removed' });
          sentenceBus.emit('tree-update:tags', {
            sentenceJson: {
              metaJson: response.data,
              treeJson: sentenceBus.sentenceSVGs[username].treeJson,
            },
            userId: username,
          });
          const exportedConll = sentenceBus.sentenceSVGs[username].exportConll();
          sentence.conlls[username] = exportedConll;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
  },
});
