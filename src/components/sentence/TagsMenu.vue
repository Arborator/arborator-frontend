<template>
    <q-menu style="min-height: 200px; width:500px;" class="q-gutter-sm">
        <div class="row text-h6">
            {{ $t('sentenceCard.addTag') }}
        </div>
        <q-separator />
        <div class="row q-pa-md q-gutter-md">
            <div class="col-9">
                <q-select 
                    outlined 
                    dense 
                    v-model="tags" 
                    use-input 
                    multiple 
                    option-value="value" 
                    hide-dropdown-icon
                    input-debounce="0" 
                    :label="$t('tagsMenu.enterTags')"
                    :options="filteredTags" 
                    emit-value 
                    @filter="filterTags"
                    @new-value="createUserTag"
                    :error="tagsFormatError"
                    :error-message="$t('tagsMenu.tagsFormatError')"
                >
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
                                {{ $t('tagsMenu.createNewTag') }}
                            </q-item-section>
                        </q-item>
                    </template>
                </q-select>
            </div>
            <div class="col-2">
                <q-btn :disable="tags.length === 0" color="primary" @click="addNewTag()" :label="$t('tagsMenu.addTags')"/>
            </div>
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
        openTabUser: {
            type: String as PropType<string>,
            required: true,
        }
    },
    data() {
        const filteredTags: tag_t[] = [];
        return {
            filteredTags,
            tags: [],
            tagsFormatError: false,
        }
    },
    computed: {
        ...mapState(useTagsStore, ['defaultTags']),
        ...mapState(useUserStore, ['username']),
        projectName() {
            return this.$route.params.projectname as string;
        }
    },
    watch: {
        tags(){
            this.tagsFormatError = false;
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
            const conll = this.reactiveSentencesObj[this.openTabUser].exportConllWithModifiedMeta(metaToReplace);
            const data = { tags: this.tags, tree: conll }
            api
                .addTags(this.projectName, this.sampleName, data)
                .then((response) => {
                    this.sentenceBus.emit('tree-update:tags', {
                        sentenceJson: {
                            metaJson: response.data,
                            treeJson: this.sentenceBus.sentenceSVGs[this.openTabUser].treeJson,
                        },
                        userId: this.openTabUser,
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
            const existingTagsString = this.reactiveSentencesObj[this.openTabUser].state.metaJson["tags"] as string || '';
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
           
            if(this.CheckTagsFormatError(val)) {
                this.tagsFormatError = true;
            } else {
                if (!this.defaultTags.map((tag) => tag.value).includes(val)) {
                    this.defaultTags.push({ value: val, color: 'grey-4' });
                    const data = { tags: val }
                    api.createUserTags(this.projectName, this.username, data).catch((error) => { notifyError(error);});
                }
                done(val, 'toggle');
            }   
        },
        CheckTagsFormatError (val : string) {
            return val.trim().length === 0 || val.includes(",");
        }
    },


});
</script>
<style lang="stylus">

</style>