<template>
  <q-menu style="min-height: 200px; width: 500px" class="q-gutter-sm">
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
            <q-chip removable @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex" text-color="primary" size="sm">
              {{ scope.opt }}
            </q-chip>
          </template>
          <template class="q-pa-md" v-slot:option="scope">
            <div class="row q-pa-xs">
              <div class="col-9">
                <q-chip v-bind="scope.itemProps" icon="add" :color="scope.opt.color" size="sm">
                  {{ scope.opt.value }}
                </q-chip>
              </div>
              <div v-if="!defaultTags.map(tag => tag.value).includes(scope.opt.value)" class="col-1">
                <q-btn flat icon="delete" color="primary" @click="removeUserTag(scope.opt.value)" />
              </div>
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
        <q-btn :disable="tags.length === 0" color="primary" @click="addNewTag()" :label="$t('tagsMenu.addTags')" />
      </div>
    </div>
  </q-menu>
</template>
<script lang="ts">
import { mapActions, mapState, mapWritableState } from 'pinia';
import { grewSearchResultSentence_t } from 'src/api/backend-types';
import { useUserStore } from 'src/pinia/modules/user';
import { reactive_sentences_obj_t, sentence_bus_t } from 'src/types/main_types';
import { notifyError } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';
import { useProjectStore } from 'src/pinia/modules/project';
import { tag_t, useTagsStore } from 'src/pinia/modules/tags';

import api from '../../api/backend-api';

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
    },
    sentence: {
      type: Object as PropType<grewSearchResultSentence_t>,
      required: true,
    },
  },
  data() {
    const filteredTags: tag_t[] = [];
    return {
      filteredTags,
      tags: [],
      tagsFormatError: false,
    };
  },
  computed: {
    ...mapState(useTagsStore, ['userTags', 'defaultTags']),
    ...mapWritableState(useTagsStore, ['userTags']),
    ...mapState(useUserStore, ['username']),
    ...mapState(useProjectStore, ['name']),
  },
  watch: {
    tags() {
      this.tagsFormatError = false;
    },
  },
  mounted() {
    this.getUserTags(this.username);
  },
  methods: {
    ...mapActions(useTagsStore, ['getUserTags']),
    addNewTag() {
      const data = { tags: this.tags, tree: this.sentence.conlls[this.openTabUser] };
      api
        .addTags(this.name, this.sampleName, data)
        .then((response) => {
          this.sentenceBus.emit('tree-update:tags', {
            sentenceJson: {
              metaJson: response.data,
              treeJson: this.sentenceBus.sentenceSVGs[this.openTabUser].treeJson,
            },
            userId: this.openTabUser,
          });
          this.tags = [];
          const exportedConll = this.reactiveSentencesObj[this.openTabUser].exportConll();
          this.sentence.conlls[this.openTabUser] = exportedConll;
        })
        .catch((error) => {
          notifyError({ error, caller: 'addNewTag' });
        });
    },
    filterTags(val: string, update: (callback: () => void) => void) {
      const tagsListWithoutRedundants = [...new Set(this.userTags)];
      const existingTagsString = (this.reactiveSentencesObj[this.openTabUser].state.metaJson['tags'] as string) || '';
      const existingTagsArray = existingTagsString.split(',').map((tag) => tag.trim());

      this.filteredTags =
        existingTagsArray.length > 0 ? tagsListWithoutRedundants.filter((tag) => !existingTagsArray.includes(tag.value)) : tagsListWithoutRedundants;

      if (val === '') {
        update(() => {
          this.filteredTags = this.filteredTags;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.filteredTags = this.filteredTags.filter((v) => v.value.toLowerCase().indexOf(needle) > -1);
      });
    },
    createUserTag(val: string, done: (value: string, mode: string) => void) {
      if (this.CheckTagsFormatError(val)) {
        this.tagsFormatError = true;
      } else {
        if (!this.userTags.map((tag) => tag.value).includes(val)) {
          this.userTags.push({ value: val, color: 'grey-4' });
          const data = { tags: val };
          api.createUserTags(this.name, this.username, data)
          .catch((error) => {
            notifyError({ error, caller: 'createUserTag' });
          });
        }
        done(val, 'toggle');
      }
    },
    CheckTagsFormatError(val: string) {
      return val.trim().length === 0 || val.includes(',');
    },
    removeUserTag(tag: string) {
      api.deleteUserTag(this.name, this.username, tag)
      .then(() => {
        this.userTags.splice(this.userTags.map(tag => tag.value).indexOf(tag), 1)
        this.filterTags('', () => {})
      })
      .catch((error) => {
        notifyError({ error, caller: 'removeUserTag' });
      });
    }
  },
});
</script>
