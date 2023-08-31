<template>
    <q-menu style="height: 200px;">
        <div class="row q-pa-md text-bold">
            Add tag to this tree
        </div>
        <q-separator />
        <div class="row q-pa-md">
            <q-select 
                outlined dense v-model="tags" use-input multiple option-value="value" hide-dropdown-icon
                input-debounce="0" label="Add tags" :options="filteredTags" emit-value @filter="filterTags"
                @new-value="createUserTag">
                <template v-slot:selected-item="scope">
                    <q-chip removable @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex"
                        text-color="primary" size="sm">
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
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            Press enter to create this tag
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
        </div>
        <div class="row q-pa-md">
            <q-btn outline color="primary" @click="addNewTag()">Add new tag</q-btn>
        </div>
    </q-menu>
</template>
<script lang="ts">
import api from '../../api/backend-api';

import { notifyError, notifyMessage } from 'src/utils/notify';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { mapState, mapActions } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { useTagsStore, tag_t } from 'src/pinia/modules/tags';

import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'TagsMenu',
    props: {
        sampleName: {
            type: String as PropType<string>,
            required: true,
        },
        reactiveSentencesObj: {
            type: Object as PropType<reactive_sentences_obj_t>,
            required: true,
        },
        sentenceBus: {
            type: Object as PropType<sentence_bus_t>,
            required: true,
        },
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
        projectName() {
            return this.$route.params.projectname as string;
        }
    },
    mounted() {
        this.getUserTags(this.username);
    },
    methods: {
        ...mapActions(useTagsStore, ['getUserTags']),
        addNewTag() {
            const metaToReplace = {
                timestamp: Math.round(Date.now()),
            };
            const conll = this.reactiveSentencesObj[this.username].exportConllWithModifiedMeta(metaToReplace);
            const data = { tags: this.tags, tree: conll }
            api
                .addTags(this.projectName, this.sampleName, data)
                .then((response) => {
                    this.sentenceBus.emit('tree-update:tags', {
                        sentenceJson: {
                            metaJson: response.data,
                            treeJson: this.sentenceBus.sentenceSVGs[this.username].treeJson,
                        },
                        userId: this.username,
                    });
                    this.tags = [];
                    notifyMessage({ message: 'Tags Saved' });
                })
                .catch((error) => {
                    notifyError({ error: error });
                })
        },
        filterTags(val: string, update: (callback: () => void) => void) {

            const tagsListWithoutRedundants = [...new Set(this.defaultTags)]
            const existingTagsString = this.reactiveSentencesObj[this.username].state.metaJson["tags"] as string || '';
            const existingTagsArray = existingTagsString.split(",").map((tag) => tag.trim());

            this.filteredTags = existingTagsArray.length > 0
                ? tagsListWithoutRedundants.filter(tag => !existingTagsArray.includes(tag.value))
                : tagsListWithoutRedundants

            if (val === '') {
                update(() => {
                    this.filteredTags = this.filteredTags;
                });
                return;
            }
            update(() => {
                const needle = val.toLowerCase();
                this.filteredTags = this.filteredTags.filter(v => v.value.toLowerCase().indexOf(needle) > -1);
            });
        },
        createUserTag(val: string, done: (value: string, mode: string) => void) {
            if (val.length > 0) {
                if (!this.defaultTags.map((tag) => tag.value).includes(val)) {
                    this.defaultTags.push({ value: val, color: 'grey-4' });
                    const data = { tags: val }
                    api.createUserTags(this.projectName, this.username, data)
                        .catch((error) => {
                            notifyError(error);
                        });
                }
                done(val, 'toggle');
            }
        },
    },


});
</script>
<style lang="stylus">

</style>