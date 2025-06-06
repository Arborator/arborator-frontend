<template>
  <q-card :class="$q.dark.isActive ? '' : 'bg-blue-grey-1 text-black'" class="full">
    <q-bar class="bg-primary text-white sticky-bar">
      <q-space />
      <div class="text-weight-bold">{{ $t('projectSettings.title') }}</div>
      <q-space />
      <q-btn v-close-popup dense flat icon="close">
        <q-tooltip content-class="bg-white text-primary">{{ $t('projectSettings.windowClose') }}</q-tooltip>
      </q-btn>
    </q-bar>

    <q-card-section class="q-pa-sm row q-gutter-md">
      <q-banner rounded class="col-md-4 offset-md-4 col-xs-12 col-sm-12">
        <q-img :ratio="16 / 9" :src="image ? image : imageTree" basic>
          <div class="absolute-bottom text-h6">
            <ProjectVisibility :visibility="visibilityLocal" :blind-annotation-mode="blindAnnotationModeLocal" />
            {{ projectName }}
          </div>
        </q-img>
      </q-banner>
    </q-card-section>

    <q-card-section class="q-pa-sm row items-start q-gutter-md">
      <q-card bordered flat class="col col-sm-12">
        <q-card-section class="q-gutter-md">
          <q-file outlined v-model="uploadImage.image" label="Change Image" use-chips clearable :loading="uploadImage.submitting">
            <template v-slot:append>
              <q-btn
                flat
                color="primary"
                icon="cloud_upload"
                :loading="uploadImage.submitting"
                :disable="!uploadImage.image"
                accept=".jpg, image/*"
                @click="uploadProjectImage()"
              />
            </template>
          </q-file>
          <q-input 
            outlined 
            v-model="newProjectName" 
            :label="$t('renameProject.title')"
            :rules="[
              (val) => (val && val.length > 0) || $t('createProjectCard.inputWarning[0]'),
              (val) => (val && !val.endsWith(' ')) || $t('createProjectCard.inputWarning[1]'),
              (val) => (val && !val.includes('\\') && !val.includes('/')) || $t('createProjectCard.inputWarning[2]'),
            ]"
          >
            <template #append>
              <q-btn :disable="disableRenameProjectBtn" flat color="primary" icon="save" @click="renameProject()" />
            </template>
          </q-input>
          <q-input v-model="projectDescription" label="Description" outlined type="textarea">
            <template #append>
              <q-btn color="primary" icon="save" dense flat @click="saveDescription" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </q-card-section>

    <q-card-section class="q-pa-sm row items-start q-gutter-md">
      <q-card bordered flat class="col col-sm-12">
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.toggleVisibility') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.toggleVisibilityCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <div>
                <q-btn-toggle
                  v-model="visibilityLocal"
                  label="Visibility"
                  toggle-color="primary"
                  :options="[
                    { label: 'Private', value: 0 },
                    { label: 'Open', value: 1 },
                    { label: 'Public', value: 2 },
                  ]"
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="collaborativeMode">
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.toggleBlindAnnotationMode') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.toggleBlindAnnotationModeCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle v-model="blindAnnotationModeLocal" color="primary" checked-icon="check" unchecked-icon="clear" />
            </q-item-section>
          </q-item>
          <q-item v-if="collaborativeMode">
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.toggleDiffMode') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.toggleDiffModeCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle v-model="diffModeLocal" color="primary" checked-icon="check" unchecked-icon="clear" />
            </q-item-section>
          </q-item>
          <q-item v-if="isOwner">
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.freezeProject') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.freezeProjectCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle v-model="freezedLocal" color="primary" checked-icon="check" unchecked-icon="clear" />
            </q-item-section>
          </q-item>
          <q-item v-if="collaborativeMode">
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.chooseUserDiff') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.chooseUserDiffCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-select
                outlined
                dense
                v-model="diffUserIdLocal"
                :disable="!diffModeLocal"
                :label="$t('projectSettings.selectDiffUser')"
                color="primary"
                :options="projectTressFrom"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.configProject') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.configProjectCaption') }}  {{ configLocal }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-select
                outlined
                dense
                v-model="configLocal"
                :label="$t('projectSettings.configProjectSelect')"
                color="primary"
                :options="annotationConfigOptions"
                stack-label
                emit-value
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.projectLanguage') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.projectLanguageCaption') }} {{ language }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <div class="row">
                <div class="col-md-11 q-pr-md">
                  <LanguageSelect :multiple="false" :languages-list="languagesList" @selected-value="getSelectedLanguage" />
                </div>
                <div class="col-md-1">
                  <q-btn color="primary" flat round dense icon="save" @click="updateProjectLanguage()" />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-card-section>

    <q-card-section class="full row justify-between q-gutter-md">
      <UserSelect v-if="collaborativeMode" :project-name="projectName" />
      <q-card flat bordered class="col">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ $t('projectSettings.shownFeaturesPanel') }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="shownFeaturesLocal"
            outlined
            multiple
            :options="shownFeaturesChoices"
            use-chips
            stack-label
            :label="$t('projectSettings.shownFeaturesTokens')"
          />
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="shownMetaLocal"
            outlined
            multiple
            :options="shownMetaChoices"
            use-chips
            stack-label
            :label="$t('projectSettings.shownFeaturesSentences')"
          />
        </q-card-section>
      </q-card>
    </q-card-section>
    <q-card-section class="q-pa-sm row items-start">
      <q-card bordered flat class="col col-sm-12">
        <q-toolbar class="bg-primary text-white q-ma-none shadow-2 fixed-header">
          <div class="text-h6 text-center">
            {{ $t('projectSettings.annotationSettingsInput') }}
          </div>
          <q-space />
          <q-btn
            color="bg-primary"
            :label="$t('projectSettings.annotationSettingsSave')"
            icon="save"
            dense
            flat
            :disabled="!annotationFeaturesOk"
            no-caps
            @click="saveAnnotationSettings()"
          >
          </q-btn>
          <q-select
            class="q-pa-md"
            outlined
            flat
            v-model="configType"
            label="Select standard config"
            :options="configTypes"
            emit-value
            bg-color="white"
            style="width: 300px"
            @update:model-value="updateConlluSchema"
            />
          <q-chip :icon="annotationFeaturesOk ? 'sentiment_satisfied_alt' : 'sentiment_very_dissatisfied'">
            {{ annotationFeaturesComment }}
          </q-chip>
        </q-toolbar>
        <JsonEditorVue 
          v-model="annotationFeaturesJson" 
          v-bind="params"
        ></JsonEditorVue>
      </q-card>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import JsonEditorVue from 'json-editor-vue';

import { mapActions, mapState, mapWritableState } from 'pinia';
import { sample_t, annotationFeatures_t } from 'src/api/backend-types';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import LanguageSelect from '../shared/LanguageSelect.vue';
import UserSelect from '../UserSelect.vue';
import ProjectVisibility from '../shared/ProjectVisibility.vue';

export default defineComponent({
  name: 'ProjectSettingsView',
  components: {
    UserSelect,
    LanguageSelect,
    ProjectVisibility,
    JsonEditorVue
  },
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    },
    samples: {
      type: Object as PropType<sample_t[]>,
      required: true,
    },
  },
  data() {
    const uploadImage: { image: File | null; submitting: boolean } = { image: null, submitting: false };
    const annotationConfigOptions = [
      { value: 'sud', label: 'SUD' },
      { value: 'ud', label: 'UD' },
      { value: 'other', label: 'Other' },
    ];
    return {
      uploadImage,
      annotationFeaturesJson: '',
      annotationFeaturesOk: true,
      annotationFeaturesComment: '',
      projectDescription: '',
      selectedLanguage: '',
      newProjectName: this.projectName,
      annotationConfigOptions,
      params: {
        mainMenuBar: false,
        mode: 'text',
        tabSize: 4,
        indentation: 4,
      },
      currentFeatures: {} as annotationFeatures_t,
      configType: '',
      configTypes: [
        { label: 'UD standard configuration', value: 'ud' },
        { label: 'SUD standard configuration', value: 'sud' },
      ]
    };
  },
  computed: {
    ...mapWritableState(useProjectStore, [
      'description',
      'blindAnnotationMode',
      'diffMode',
      'diffUserId',
      'visibility',
      'shownFeatures',
      'shownMeta',
      'image',
      'imageTree',
      'language',
      'freezed',
      'config'
    ]),
    ...mapState(useProjectStore, [
      'isOwner',
      'shownFeaturesChoices',
      'shownMetaChoices',
      'annotationFeatures',
      'getSudConfig',
      'getUdConfig',
      'image',
      'language',
      'languagesList',
      'collaborativeMode',
      'freezed', 
      'config'
    ]),

    blindAnnotationModeLocal: {
      get() {
        return this.blindAnnotationMode || false;
      },
      set(value: boolean) {
        this.updateProjectSettings(this.projectName, { blindAnnotationMode: value });
      },
    },
    freezedLocal: {
      get(): boolean {
        return this.freezed || false;
      },
      set(value: boolean) {
        this.updateProjectSettings(this.projectName, { freezed: value });
      },
    },
    diffModeLocal: {
      get() {
        return this.diffMode || false;
      },
      set(value: boolean) {
        this.updateProjectSettings(this.projectName, { diffMode: value });
      },
    },
    diffUserIdLocal: {
      get() {
        return this.diffUserId || '';
      },
      set(value: string) {
        this.updateProjectSettings(this.projectName, { diffUserId: value });
      },
    },
    visibilityLocal: {
      get() {
        return this.visibility;
      },
      set(value: number) {
        this.updateProjectSettings(this.projectName, { visibility: value });
      },
    },
    shownFeaturesLocal: {
      get() {
        return this.shownFeatures;
      },
      set(value: string[]) {
        this.updateProjectshownFeatures({
          projectName: this.projectName,
          toUpdateObject: { shownFeatures: value },
        });
      },
    },
    shownMetaLocal: {
      get() {
        return this.shownMeta;
      },
      set(value: string[]) {
        this.updateProjectshownFeatures({
          projectName: this.projectName,
          toUpdateObject: { shownMeta: value },
        });
      },
    },
    configLocal: {
      get() {
        return this.config;
      },
      set(value: string) {
        this.updateProjectSettings(this.projectName, { config: value });
      },
    },

    projectTressFrom() {
      const treesFrom = this.samples.map((sample) => sample.treesFrom).reduce((a: string[], b: string[]) => [...a, ...b], []);
      return [...new Set(treesFrom)];
    },
    disableRenameProjectBtn() {
      return this.newProjectName === '' || this.newProjectName.endsWith(' ') || this.newProjectName.includes('/') || this.newProjectName.includes('\\');
    }
  },
  mounted() {
    this.annotationFeaturesJson = JSON.stringify(this.annotationFeatures, null, 4);
    this.currentFeatures = this.annotationFeatures;
  },
  watch: {
    annotationFeaturesJson(newValue) {
      this.checkAnnotationFeatures(newValue);
    }
  },

  methods: {
    ...mapActions(useProjectStore, [
      'updateProjectConlluSchema',
      'updateProjectSettings',
      'postImage',
      'updateProjectshownFeatures',
    ]),
    checkAnnotationFeatures(annotation: string) {
      try {
        JSON.parse(annotation);
        this.annotationFeaturesOk = true;
        this.annotationFeaturesComment = this.$t('projectSettings.checkAnnotation');
      } catch (e) {
        this.annotationFeaturesOk = false;
        this.annotationFeaturesComment = e as string; // This is dangerous
      }
    },
    saveAnnotationSettings() {
      const parsedAnnotFeatures = JSON.parse(this.annotationFeaturesJson);
      this.updateProjectConlluSchema(this.projectName, parsedAnnotFeatures, this.currentFeatures) 
      this.$emit('reload');
    },

    saveDescription() {
      this.updateProjectSettings(this.projectName, { description: this.projectDescription });
    },

    async renameProject() {
      await this.updateProjectSettings(this.projectName, { projectName: this.newProjectName });
      this.$router.push({
        name: 'project',
        params: {
          projectname: this.newProjectName,
        },
      });
    },

    uploadProjectImage() {
      this.uploadImage.submitting = true;
      if (this.uploadImage.image) {
        this.postImage(this.uploadImage.image)
          .then(() => {
            this.uploadImage.submitting = false;
            notifyMessage({ message: 'Uploaded image saved!' });
          })
          .catch((error) => {
            notifyError({ error });
            this.uploadImage.submitting = false;
          });
      } else {
        notifyError({ error: 'No image was selected' });
      }
    },

    getSelectedLanguage(value: any) {
      this.selectedLanguage = value;
    },

    updateProjectLanguage() {
      this.updateProjectSettings(this.projectName, { language: this.selectedLanguage });
    },
    updateConlluSchema() {
      this.annotationFeaturesJson = this.configType === 'ud' ? this.getUdConfig : this.getSudConfig;
      notifyMessage({ message: "Your annotation config has been modified don't forget to save it ", type: 'warning' });
    }
  },
});
</script>

<style scoped>
.full {
  width: 90vw;
  min-width: 90vw;
}
.fixed-header {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
