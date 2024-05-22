<template>
  <q-dialog v-model="creatDialog" transition-show="fade" transition-hide="fade" persistent>
    <q-card style="min-width: 50vw">
      <q-bar class="bg-primary text-white sticky-bar">
        <q-space />
        <q-btn @click="closeDialog" flat dense icon="close" />
      </q-bar>
      <div v-if="loggedWithGithub">
        <q-linear-progress size="10px" :value="progress" color="primary" />
      </div>
      <q-card-section>
        <div class="text-h6 text-left">{{ $t('createProjectCard.title') }}</div>
      </q-card-section>
      <q-card-section v-if="!isShowSyncBtn && !isShowGithubSyncPanel" style="min-height: 20vw">
        <q-form class="q-gutter-md" @submit="onSubmit">
          <q-input
            dense
            outlined
            v-model="project.projectName"
            :label="$t('createProjectCard.projectName') + ' *'"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || $t('createProjectCard.inputWarning')]"
          />
          <q-input outlined dense v-model="project.description" label="Description" />
          <q-separator />
          <q-list>
            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-radio v-model="project.visibility" :val="2" />
              </q-item-section>
              <q-item-section side avatar>
                <q-icon size="md" name="o_groups" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('createProjectCard.visibilityMode[2]') }}</q-item-label>
                <q-item-label caption>
                  {{ $t('projectSettings.togglePrivateCaption[2]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-radio v-model="project.visibility" :val="1" />
              </q-item-section>
              <q-item-section side avatar>
                <q-icon size="md" name="o_visibility" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('createProjectCard.visibilityMode[1]') }}</q-item-label>
                <q-item-label caption>
                  {{ $t('projectSettings.togglePrivateCaption[1]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section side top>
                <q-radio v-model="project.visibility" :val="0" />
              </q-item-section>
              <q-item-section side avatar>
                <q-icon size="md" name="o_lock" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('createProjectCard.visibilityMode[0]') }}</q-item-label>
                <q-item-label caption>
                  {{ $t('projectSettings.togglePrivateCaption[0]') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-separator />
          <div class="text-h6 text-left">
            {{ $t('createProjectCard.corpusConfig') }}
          </div>
          <div class="row q-gutter-md">
            <div class="col">
              <LanguageSelect
                :multiple="false"
                :languages-list="languagesList"
                :label="' *'"
                :rules="[(val) => (val && val.length > 0) || $t('createProjectCard.inputWarning')]"
                @selected-value="getSelectedLanguage"
              />
            </div>
            <div class="col">
              <q-select
                dense
                outlined
                v-model="project.config"
                :options="annotationConfigOptions"
                stack-label
                emit-value
                lazy-rules
                :rules="[(val) => (val && val.length > 0) || $t('createProjectCard.selectWarning')]"
                :label="$t('createProjectCard.annotSettings') + ' *'"
              >
                <template v-slot:selected-item="scope">
                  {{ scope.opt.toUpperCase() }}
                </template>
              </q-select>
            </div>
          </div>
          <q-separator />
          <div class="row">
            <div class="col-md-7 text-h6">
              {{ $t('createProjectCard.annotMode') }}
            </div>
            <div class="col-md-1 offset-md-4">
              <q-btn
                outline
                round
                size="sm"
                color="primary"
                icon="question_mark"
                href="https://arborator.github.io/arborator-documentation/#/?id=blind-annotation-mode"
                target="_blank"
              >
                <q-tooltip content-class="text-white bg-primary"> Assistance </q-tooltip>
              </q-btn>
            </div>
          </div>
          <q-list>
            <q-item>
              <q-item-section side top>
                <q-checkbox v-model="project.blindAnnotationMode" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('createProjectCard.blindAnnot') }}</q-item-label>
                <q-item-label caption>
                  {{ $t('createProjectCard.blindAnnotCaption') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-separator />
          <div class="row">
            <div class="col-md-7 text-h6">
              {{ $t('createProjectCard.collaborativeMode') }}
            </div>
          </div>
          <q-list>
            <q-item>
              <q-item-section side top>
                <q-checkbox v-model="project.collaborativeMode" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('createProjectCard.collaborativeAnnot') }}</q-item-label>
                <q-item-label caption>
                  {{ $t('createProjectCard.collaborativeAnnotCaption') }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <div class="row q-gutter-md justify-center">
            <q-btn :disable="disableSubmitBtn" type="submit" :label="$t('createProjectCard.create')" color="primary" />
          </div>
        </q-form>
      </q-card-section>
      <q-card-section v-if="canSyncWithGithub" class="row justify-center q-gutter-md">
        <q-btn @click="(isShowGithubSyncPanel = true), (progress = 0.8)" :label="$t('github.synchronizeBtn')" color="primary" class="items-center" />
      </q-card-section>
      <q-card-section v-if="canSyncWithGithub">
        <div class="row justify-center q-gutter-md clickable" v-close-popup>{{ $t('github.skipSync') }}</div>
      </q-card-section>
      <GithubSyncDialog v-if="isShowGithubSyncPanel" :projectName="project.projectName" @created="reloadAfterSync" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { mapActions, mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import api from '../api/backend-api';
import GithubSyncDialog from '../components/github/GithubSyncDialog.vue';
import LanguageSelect from './shared/LanguageSelect.vue';

export default defineComponent({
  components: {
    GithubSyncDialog,
    LanguageSelect,
  },
  name: 'CreaProjectCard',
  emits: ['created'],
  props: {
    parentGetProjects: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  data() {
    const annotationConfigOptions = [
      { value: 'sud', label: 'SUD' },
      { value: 'ud', label: 'UD' },
      { value: 'other', label: 'Other' },
    ];
    return {
      submitting: false,
      project: {
        projectName: '',
        description: '',
        visibility: 2,
        language: '',
        config: '',
        blindAnnotationMode: false,
        collaborativeMode: true,
      },
      creatDialog: true,
      progress: 0,
      isShowSyncBtn: false,
      isShowGithubSyncPanel: false,
      synchronized: '',
      annotationConfigOptions,
      selectedLanguage: [],
    };
  },
  computed: {
    ...mapState(useUserStore, ['username', 'loggedWithGithub']),
    ...mapState(useProjectStore, ['languagesList']),
    canSyncWithGithub() {
      return this.loggedWithGithub && this.isShowSyncBtn && !this.isShowGithubSyncPanel;
    },
    disableSubmitBtn() {
      return this.project.projectName === '' || this.project.language === '' || this.project.config === '';
    },
  },
  methods: {
    ...mapActions(useProjectStore, ['resetAnnotationFeatures']),
    getSelectedLanguage(value: any) {
      if (value) {
        this.project.language = value;
      }
    },
    onSubmit() {
      this.submitting = true;
      this.resetAnnotationFeatures();
      const data = {
        ...this.project,
      };
      api
        .createProject(data)
        .then(() => {
          this.parentGetProjects();
          this.submitting = false;
          if (this.loggedWithGithub && !this.project.blindAnnotationMode) {
            this.progress = 0.4;
            this.isShowSyncBtn = true;
          } else {
            this.closeDialog();
          }
          notifyMessage({
            message: `${this.project.projectName} ${this.$t('createProjectCard.createMessage')}`,
          });
        })
        .catch((error) => {
          notifyError({ error });
          this.submitting = false;
        });
    },
    reloadAfterSync() {
      this.progress = 1;
      this.creatDialog = false;
      this.parentGetProjects();
      this.$emit('created');
    },

    closeDialog() {
      this.creatDialog = false;
      this.$emit('created');
    },
  },
});
</script>
<style scoped lang="stylus">
.clickable:hover {
  cursor: pointer;
  color: blue;
}
</style>
