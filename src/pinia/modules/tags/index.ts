import api from '../../../api/backend-api';
import { notifyError} from 'src/utils/notify';
import { defineStore } from "pinia";
import { useUserStore } from '../user';
import { useProjectStore } from '../project';

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
        getUserTags(){
            api
              .getUserTags(useProjectStore().name, useUserStore().username)
              .then((response) => {
                if (response.data){
                    for(const tag of response.data){
                        if (!this.defaultTags.map((val) => val.value).includes(tag)){
                            this.defaultTags.push({value: tag, color: 'gery-4'});
                        }
                    }
                }
              })
              .catch((error) => {
                notifyError({error})
              });
        },
    }

})