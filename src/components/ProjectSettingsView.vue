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
        <q-img :ratio="16 / 9" :src="imageSrc" basic>
          <div class="absolute-bottom text-h6">
            <ProjectIcon :visibility="visibilityLocal" :exercise-mode="exerciseModeLocal" />
            {{ projectname }}
          </div>
        </q-img>

        <template #action>
          <q-file v-model="uploadImage.image" label="Change Image" borderless standout filled use-chips clearable :loading="uploadImage.submitting">
            <template #after>
              <q-btn
                color="primary"
                icon="cloud_upload"
                round
                :loading="uploadImage.submitting"
                :disable="uploadImage.image === null"
                accept=".jpg, image/*"
                @click="uploadProjectImage()"
              />
            </template>
          </q-file>
        </template>
      </q-banner>
    </q-card-section>
    <!-- project description: -->
    <q-card-section>
      <q-input v-model="projectDescription" style="height: 100px" label="Description" outlined type="textarea" />
      <q-btn color="primary" :label="$t('projectSettings.descriptionSave')" icon="save" dense flat @click="saveDescription"></q-btn>
    </q-card-section>
    <!-- project options: -->
    <q-card-section class="q-pa-sm row items-start q-gutter-md">
      <q-card bordered flat class="col col-sm-12">
        <q-list>
          <q-item tag="label">
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.togglePrivate') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.togglePrivateCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <div>
                <q-btn-toggle
                  v-model="visibilityLocal"
                  label="Visibility"
                  toggle-color="primary"
                  :options="[
                    { label: 'Private', value: 0 },
                    { label: 'Visible', value: 1 },
                    { label: 'Open', value: 2 },
                  ]"
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item tag="label">
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.toggleAllVisible') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.toggleAllVisibleCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle v-model="showAllTreesLocal" color="primary" checked-icon="check" unchecked-icon="clear" />
            </q-item-section>
          </q-item>

          <q-item tag="label">
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.toggleExerciseMode') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.toggleExerciseModeCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle v-model="exerciseModeLocal" color="primary" checked-icon="check" unchecked-icon="clear" />
            </q-item-section>
          </q-item>

          <q-item id="option__diff-mode" tag="label">
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.toggleDiffMode') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.toggleDiffModeCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle v-model="diffModeLocal" color="primary" checked-icon="check" unchecked-icon="clear" />
            </q-item-section>
          </q-item>

          <q-item id="option__usertree-diff" tag="label">
            <q-item-section>
              <q-item-label>{{ $t('projectSettings.chooseUserDiff') }}</q-item-label>
              <q-item-label caption>{{ $t('projectSettings.chooseUserDiffCaption') }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-select v-model="diffUserIdLocal" :disable="!diffModeLocal" label="Select user" color="primary" :options="projectTreesFrom" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-card-section>
    <q-card-section class="full row justify-between q-gutter-md">
      <UserSelect :project-name="$props.projectname" />
      <!-- shown features: -->
      <q-card flat bordered class="col">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ $t('projectSettings.shownFeaturesPanel') }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="shownFeaturesLocal"
            filled
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
            filled
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
        <q-toolbar class="bg-primary text-white q-ma-none shadow-2">
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
          <q-btn
            color="bg-primary"
            label="Reset to SUD"
            icon="replay"
            dense
            flat
            :disabled="!annotationFeaturesOk"
            no-caps
            @click="resetAnnotationFeaturesWrapper()"
          >
          </q-btn>
          <q-btn
            color="bg-primary"
            label="Reset to UD"
            icon="replay"
            dense
            flat
            :disabled="!annotationFeaturesOk"
            no-caps
            @click="resetAnnotationFeaturesUDWrapper()"
          >
          </q-btn>
          <q-chip :icon="annotationFeaturesOk ? 'sentiment_satisfied_alt' : 'sentiment_very_dissatisfied'">
            {{ annotationFeaturesComment }}
          </q-chip>
        </q-toolbar>
        <Codemirror 
          v-model:value="annotationFeaturesJson" 
          :options="cmOption" 
          @input="checkAnnotationFeatures"
          height="700"
          ></Codemirror>
      </q-card>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import Codemirror from 'codemirror-editor-vue3';

// plugin-style
import 'codemirror-editor-vue3/dist/style.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/fold/foldcode'; 
import 'codemirror/addon/fold/foldgutter'; 
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/brace-fold'; 

import UserSelectTable from './UserSelectTable.vue';
import ConfirmAction from './ConfirmAction.vue';
import UserSelect from './UserSelect.vue';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';

import { defineComponent, PropType } from 'vue';
import ProjectIcon from 'components/shared/ProjectIcon.vue';

export default defineComponent({
  name: 'ProjectSettingsView',
  components: {
    ProjectIcon,
    Codemirror,
    UserSelect,
    UserSelectTable,
    ConfirmAction,
  },
  props: {
    projectname: {
      type: String as PropType<string>,
      required: true,
    },
    projectTreesFrom: {
      type: Object as PropType<string[]>,
      default: [],
    },
  },
  data() {
    const confirmActionCallback: CallableFunction = () => {
      console.log('default callback');
    };
    const uploadImage: { image: string | null; submitting: boolean } = { image: null, submitting: false };
    return {
      addAdminDial: false,
      addGuestDial: false,
      confirmActionCallback,
      confirmActionDial: false,
      confirmActionArg1: '',
      uploadImage,
      annotationFeaturesJson: '',
      annotationFeaturesOk: true,
      annotationFeaturesComment: '',
      projectDescription:'',
      cmOption: {
        tabSize: 8,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        line: true,
        mode: 'javascript',
        theme: 'default',
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      },
    };
  },
  computed: {
    ...mapWritableState(useProjectStore, [
      'description',
      'showAllTrees',
      'exerciseMode',
      'diffMode',
      'diffUserId',
      'visibility',
      'shownFeatures',
      'shownMeta',
      'admins',
      'guests',
      'imageSrc'
    ]),
    ...mapState(useProjectStore, [
      'isAdmin',
      'admins',
      'guests',
      'shownFeaturesChoices',
      'shownMetaChoices',
      'getAnnofjson',
      'getUDAnnofJson',
      'imageSrc'
    ]),
    showAllTreesLocal: {
      get() {
        return this.showAllTrees;
      },
      set(value: boolean) {
        this.updateProjectSettings(this.projectname, { showAllTrees: value });
      },
    },
    exerciseModeLocal: {
      get() {
        return this.exerciseMode || false;
      },
      set(value: boolean) {
        this.updateProjectSettings(this.projectname, { exerciseMode: value });
      },
    },
    diffModeLocal: {
      get() {
        return this.diffMode || false;
      },
      set(value: boolean) {
        this.updateProjectSettings(this.projectname, { diffMode: value });
      },
    },
    diffUserIdLocal: {
      get() {
        return this.diffUserId || '';
      },
      set(value: string) {
        this.updateProjectSettings(this.projectname, { diffUserId: value });
      },
    },
    visibilityLocal: {
      get() {
        return this.visibility;
      },
      set(value: number) {
        this.updateProjectSettings(this.projectname, { visibility: value });
      },
    },
    shownFeaturesLocal: {
      get() {
        return this.shownFeatures;
      },
      set(value: string[]) {
        this.updateProjectshownFeatures({
          projectname: this.$props.projectname,
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
          projectname: this.$props.projectname,
          toUpdateObject: { shownMeta: value },
        });
      },
    },
  },
  mounted() {
    this.annotationFeaturesJson = this.getAnnofjson;
    this.getProjectImage();
  },

  methods: {
    ...mapActions(useProjectStore, [
      'updateProjectConlluSchema',
      'resetAnnotationFeatures',
      'resetAnnotationFeaturesUD',
      'updateProjectSettings',
      'postImage',
      'getImage',
      'updateProjectshownFeatures',
    ]),
    /**
     * Parse annotation features. Display a related informative message dependeing on success
     *
     * @returns void
     */
    checkAnnotationFeatures() {
      try {
        JSON.parse(this.annotationFeaturesJson);
        this.annotationFeaturesOk = true;
        this.annotationFeaturesComment = this.$t('projectSettings.checkAnnotation');
      } catch (e) {
        this.annotationFeaturesOk = false;
        this.annotationFeaturesComment = e as string; // This is dangerous
      }
    },
    saveAnnotationSettings() {
      this.updateProjectConlluSchema(this.projectname, JSON.parse(this.annotationFeaturesJson))
        .then(() => {
          notifyMessage({ message: 'New annotation settings saved on the server', icon: 'save' });
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    resetAnnotationFeaturesWrapper() {
      this.resetAnnotationFeatures();
      this.annotationFeaturesJson = this.getAnnofjson;
    },

    resetAnnotationFeaturesUDWrapper() {
      this.resetAnnotationFeaturesUD();
      this.annotationFeaturesJson = this.getUDAnnofJson;
    },

    saveDescription() {
      this.updateProjectSettings(this.projectname, { description: this.projectDescription });
    },

    uploadProjectImage() {
      this.uploadImage.submitting = true;
      if (this.uploadImage.image) {
        this.postImage(this.uploadImage.image)
          .then(() => {
            this.uploadImage.submitting = false;
            this.getProjectImage();
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
    
    getProjectImage() {
      this.getImage(this.projectname);
    },
    /**
     * Wrapper to display the confirm dialog prior to executing the method
     *
     * @param {method} method
     * @param {*} arg
     * @returns void
     */
    triggerConfirm(method: CallableFunction, arg: string) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
      this.confirmActionArg1 = arg;
    },
  },
});
</script>

<style scoped>
.full {
  width: 90vw;
  min-width: 90vw;
}
</style>
