<template>
  <q-card :class="$q.dark.isActive ? '' : 'bg-blue-grey-1 text-black'" class="full">
    <q-bar class="bg-primary text-white">
      <q-space />
      <div class="text-weight-bold">{{ $t('projectSettings.title') }}</div>
      <q-space />
      <q-btn v-close-popup dense flat icon="close">
        <q-tooltip content-class="bg-white text-primary">{{ $t('projectSettings.windowClose') }}</q-tooltip>
      </q-btn>
    </q-bar>
    <q-card-section class="q-pa-sm row q-gutter-md">
      <q-banner rounded class="col-md-4 offset-md-4 col-xs-12 col-sm-12">
        <q-img :ratio="16 / 9" :src="cleanedImage" basic>
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
      <q-input v-model="description" style="height: 100px" label="Description" filled type="textarea" />
      <q-btn color="primary" :label="$t('projectSettings.descriptionSave')" icon="save" dense flat @click="saveDescription"></q-btn>
    </q-card-section>
    <!-- project options: -->
    <q-card-section class="q-pa-sm row items-start q-gutter-md">
      <q-card class="col col-sm-12">
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
                  glossy
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
      <!-- admin panel -->
      <q-card bordered class="col">
        <q-scroll-area style="height: 500px">
          <q-card-section>
            <div class="text-h6 text-center">
              {{ $t('projectSettings.adminsPanel') }}
              <q-btn v-show="isAdmin" flat round icon="add" color="primary" @click="addAdminDial = true"></q-btn>
            </div>
          </q-card-section>
          <q-markup-table flat bordered>
            <thead>
              <tr>
                <th class="text-left">Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="admin in admins" :key="admin" v-ripple>
                <td>{{ admin }}</td>
                <td>
                  <q-btn
                    v-show="isAdmin"
                    dense
                    round
                    flat
                    icon="remove"
                    :color="$q.dark.isActive ? 'red-13' : 'negative'"
                    @click="triggerConfirm(removeAdmin, admin)"
                  ></q-btn>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-scroll-area>
      </q-card>
      <!-- guest panel: -->
      <q-card bordered class="col">
        <q-scroll-area style="height: 500px">
          <q-card-section>
            <div class="text-h6 text-center">
              {{ $t('projectSettings.guestsPanel') }}
              <q-btn v-show="isAdmin" flat round icon="add" color="primary" @click="addGuestDial = true"></q-btn>
            </div>
          </q-card-section>

          <q-markup-table flat bordered>
            <thead>
              <tr>
                <th class="text-left">Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="guest in guests" :key="guest" v-ripple>
                <td>{{ guest }}</td>
                <td>
                  <q-btn
                    v-show="isAdmin"
                    dense
                    round
                    flat
                    icon="remove"
                    :color="$q.dark.isActive ? 'red-13' : 'negative'"
                    @click="triggerConfirm(removeGuest, guest)"
                  ></q-btn>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-scroll-area>
      </q-card>
      <!-- shown features: -->
      <q-card bordered class="col">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ $t('projectSettings.shownFeaturesPanel') }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="shownfeaturesLocal"
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
            v-model="shownmetaLocal"
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
    <q-card-section class="q-pa-sm row items-start q-gutter-md">
      <q-card class="col col-sm-12">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ $t('projectSettings.annotationSettingsInput') }}
          </div>
        </q-card-section>
        <q-card-section>
          <Codemirror v-model:value="annotationFeaturesJson" :options="cmOption" @input="checkAnnotationFeatures"></Codemirror>
        </q-card-section>
        <q-btn
          color="bg-primary"
          text-color="primary"
          :label="$t('projectSettings.annotationSettingsSave')"
          icon="save"
          dense
          flat
          :disabled="!annotationFeaturesOk"
          no-caps
          @click="saveAnnotationSettings()"
        ></q-btn>
        <q-btn
          color="bg-primary"
          text-color="primary"
          label="Reset to SUD"
          icon="replay"
          dense
          flat
          :disabled="!annotationFeaturesOk"
          no-caps
          @click="resetAnnotationFeaturesWrapper()"
        ></q-btn>
        <q-btn
          color="bg-primary"
          text-color="primary"
          label="Reset to UD"
          icon="replay"
          dense
          flat
          :disabled="!annotationFeaturesOk"
          no-caps
          @click="resetAnnotationFeaturesUDWrapper()"
        >
        </q-btn>
        <q-chip text-color="primary" :icon="annotationFeaturesOk ? 'sentiment_satisfied_alt' : 'sentiment_very_dissatisfied'">{{ annotationFeaturesComment }}</q-chip>
      </q-card>
    </q-card-section>

    <q-dialog v-model="addAdminDial" transition-show="fade" transition-hide="fade">
      <UserSelectTable
        :parent-callback="updateAdminsOrGuests"
        :general="true"
        selectiontype="Project Admin"
        target-role="admin"
        singlemultiple="multiple"
        :preselected="admins"
      ></UserSelectTable>
    </q-dialog>
    <q-dialog v-model="addGuestDial" transition-show="fade" transition-hide="fade">
      <UserSelectTable
        :parent-callback="updateAdminsOrGuests"
        :general="true"
        selectiontype="Project Guest"
        target-role="guest"
        singlemultiple="multiple"
        :preselected="guests"
      ></UserSelectTable>
    </q-dialog>
    <q-dialog v-model="confirmActionDial">
      <confirm-action :parent-action="confirmActionCallback" :arg1="confirmActionArg1" :target-name="$props.projectname"></confirm-action>
    </q-dialog>
  </q-card>
</template>

<script lang="ts">
import Codemirror from 'codemirror-editor-vue3';

// plugin-style
import 'codemirror-editor-vue3/dist/style.css';
import 'codemirror/mode/python/python.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';

import api from '../api/backend-api';
import UserSelectTable from './UserSelectTable.vue';
import ConfirmAction from './ConfirmAction.vue';
import {mapActions, mapState, mapWritableState,} from 'pinia';
import {useProjectStore} from 'src/pinia/modules/project';
import {notifyError, notifyMessage} from 'src/utils/notify';
import {sample_role_targetrole_t, user_t} from 'src/api/backend-types';

import {defineComponent, PropType} from 'vue';
import ProjectIcon from 'components/shared/ProjectIcon.vue';

export default defineComponent({
  name: 'ProjectSettingsView',
  components: { 
    ProjectIcon, 
    Codemirror, 
    UserSelectTable, 
    ConfirmAction 
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
      cmOption: {
        tabSize: 8,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        line: true,
        mode: 'python',
        theme: 'default',
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
      'shownfeatures',
      'shownmeta',
      'admins',
      'guests',
    ]),
    ...mapState(useProjectStore, [
      'isAdmin',
      'admins',
      'guests',
      'cleanedImage',
      'shownFeaturesChoices',
      'shownMetaChoices',
      'getAnnofjson',
      'getUDAnnofJson',
    ]),
    showAllTreesLocal: {
      get() {
        return this.showAllTrees;
      },
      set(value: boolean) {
        this.updateProjectSettings({ showAllTrees: value });
      },
    },
    exerciseModeLocal: {
      get() {
        return this.exerciseMode || false;
      },
      set(value: boolean) {
        this.updateProjectSettings({ exerciseMode: value });
      },
    },
    diffModeLocal: {
      get() {
        return this.diffMode || false;
      },
      set(value: boolean) {
        this.updateProjectSettings({ diffMode: value });
      },
    },
    diffUserIdLocal: {
      get() {
        return this.diffUserId || '';
      },
      set(value: string) {
        this.updateProjectSettings({ diffUserId: value });
      },
    },
    visibilityLocal: {
      get() {
        return this.visibility;
      },
      set(value: number) {
        this.updateProjectSettings({ visibility: value });
      },
    },
    shownfeaturesLocal: {
      get() {
        return this.shownfeatures;
      },
      set(value: string[]) {
        this.updateProjectShownFeatures({
          projectname: this.$props.projectname,
          toUpdateObject: { shownfeatures: value },
        });
      },
    },
    shownmetaLocal: {
      get() {
        return this.shownmeta;
      },
      set(value: string[]) {
        this.updateProjectShownFeatures({
          projectname: this.$props.projectname,
          toUpdateObject: { shownmeta: value },
        });
      },
    },
  },
  mounted() {
    this.annotationFeaturesJson = this.getAnnofjson;
  },

  methods: {
    ...mapActions(useProjectStore, [
      'updateProjectConlluSchema',
      'resetAnnotationFeatures',
      'resetAnnotationFeaturesUD',
      'updateProjectSettings',
      'postImage',
      'updateProjectShownFeatures',
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

    updateAdminsOrGuests(usersArray: user_t[], targetRole: sample_role_targetrole_t) {
      const newRolesArrayId = [];
      for (const user of usersArray) {
        newRolesArrayId.push(user.id);
      }
      api
        .updateManyProjectUserAccess(this.$props.projectname, targetRole, newRolesArrayId)
        .then((response) => {
          notifyMessage({ message: 'New admins/guests saved on the server', icon: 'save' });
          this.admins = response.data.admins;
          this.guests = response.data.guests;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    removeAdmin(userid: string) {
      api
        .deleteProjectUserAccess(this.$props.projectname, userid)
        .then((response) => {
          notifyMessage({ message: 'Admin removal saved on the server', icon: 'save' });
          this.admins = response.data.admins;
          this.guests = response.data.guests;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    removeGuest(userid: string) {
      api
        .deleteProjectUserAccess(this.$props.projectname, userid)
        .then((response) => {
          notifyMessage({ message: 'Guest removal saved on the server', icon: 'save' });
          this.admins = response.data.admins;
          this.guests = response.data.guests;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    saveDescription() {
      this.updateProjectSettings({ description: this.description });
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
.list-size {
  height: 150px;
}
.cm-height {
  height: 50px;
}
</style>
