import api from '../../../api/backend-api';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { defineStore } from "pinia";

export interface tag_t {
    value: string, 
    color: string,
}
export const useTagsStore = defineStore('tags', {
    state: () => {
        const defaultTags: tag_t[] = [
            { value: 'DONE', color: 'green-4' }, 
            { value: 'IN PROGRESS', color: 'teal-4' },
            { value: 'TODO', color: 'orange-4' },
            { value: 'NEW', color: 'yellow-4' },
            { value: 'ASAP', color: 'deep-orange-4'}
        ]; 
        return {
          defaultTags,  
        }
    },
    actions: { 
        addTags(projectName: string, sampleName: string, tags: string[], conll: string){
            const data = { tags: tags, tree: conll}
            api
              .addNewTags(projectName, sampleName, data)
              .then((response) => {
                notifyMessage({message: 'Tags Saved'})
              })
              .catch((error) => {
                notifyError({error: error});
              })
        }

    }
})