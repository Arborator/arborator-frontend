<template>
    <q-menu style="height: 300px;">
        <div class="row q-pa-md">
            Add tag to this tree
        </div>
        <q-separator />
        <div class="row q-pa-md">
            <q-select 
                outlined 
                dense 
                v-model="tags" 
                use-input 
                multiple 
                option-value="value" 
                hide-dropdown-icon
                input-debounce="0" 
                label="Add tags" 
                :options="filteredTags" 
                emit-value
                @filter="filterTags"
            >
                <template v-slot:selected-item="scope">
                    <q-chip removable @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex" text-color="primary" size="sm">
                        {{ scope.opt }}
                    </q-chip>
                </template>
                <template class="q-pa-md" v-slot:option="scope">
                    <div class="row q-pa-xs">
                        <q-chip v-bind="scope.itemProps" icon="add" :color="scope.opt.color" size="sm">
                            {{ scope.opt.value }}
                        </q-chip>
                    </div>
                    <q-separator />
                </template>
            </q-select>
        </div>
        <div class="row q-pa-md">
            <q-btn @click="addNewTag()">Add new tag</q-btn>
        </div>
    </q-menu>
</template>
<script lang="ts">
import { reactive_sentences_obj_t } from 'src/types/main_types';
import { mapActions, mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { useTagsStore, tag_t } from 'src/pinia/modules/tags';

import { defineComponent, PropType} from 'vue';

export default defineComponent({
    name: 'TagsMenu',
    props:{
        sampleName: {
            type: String as PropType<string>,
            required: true,
        },
        reactiveSentencesObj: {
            type: Object as PropType<reactive_sentences_obj_t>,
            required: true,
        }
    },
    data() {
        const filteredTags: tag_t[] = [];
        return {
            filteredTags, 
            tags: []
        }
    },
    computed: {
        ...mapState(useTagsStore, ['defaultTags']),
        ...mapState(useUserStore, ['username']),
    },
    methods: {
        ...mapActions(useTagsStore, ['addTags']), 
        addNewTag() {
            const projectName = this.$route.params.projectname as string; 
            const metaToReplace = {
                timestamp: Math.round(Date.now()),
            };
            const conll = this.reactiveSentencesObj[this.username].exportConllWithModifiedMeta(metaToReplace);
            this.addTags(projectName, this.sampleName, this.tags, conll);
        },
        filterTags(val: string, update: (callback: () => void) => void) {
            if (val === '') {
                update(() => {
                    this.filteredTags = this.defaultTags;
                });
                return;
            }
            update(() => {
                const needle = val.toLowerCase();
                this.filteredTags = this.defaultTags.filter(v => v.value.toLowerCase().indexOf(needle) > -1);
            });
        },

    },
    

});
</script>
<style lang="stylus">

</style>