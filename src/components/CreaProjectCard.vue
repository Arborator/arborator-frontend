<template>
  <q-dialog v-model="creatDialog" transition-show="fade" transition-hide="fade" persistent>
    <q-card :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'" style="min-width: 50vw;">
      <div v-if="loggedWithGithub">
        <q-linear-progress size="10px" :value="progress" color="primary" />
      </div>
      <q-bar class="bg-primary text-white">
        <q-space />
        <q-btn  @click="closeDialog" flat dense icon="close" />
      </q-bar>
      <q-card-section>
        <div class="text-h6 text-left">Create new Project</div>
      </q-card-section>
      <q-card-section v-if="!isShowSyncBtn && !isShowGithubSyncPanel" style="min-height: 20vw;">
        <q-form id="createprojectform" class="q-gutter-md" @submit="onSubmit">
          <q-input
            id="projectnameinput"
            v-model="project.projectName"
            filled
            label="Project name"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please type something']"
          />
          <q-input id="descriptioninput" v-model="project.description" filled label="Description" />
          <div>
            <q-btn-toggle
              v-model="project.visibility"
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
          <q-toggle v-model="project.showAllTrees" label="Show All Trees" />
          <q-toggle v-model="project.exerciseMode" :label="$t('createProjectCard.exerciseMode')" />
          <div class="row q-gutter-md justify-center">
            <q-btn :disable="project.projectName" id="submitproject" type="submit"  label="Create" color="primary" />
          </div>
        </q-form>
      </q-card-section>
      <q-card-section v-if="canSyncWithGithub" class="row justify-center q-gutter-md">
        <q-btn @click="isShowGithubSyncPanel = true, progress= 0.8" label="synchronize with Github" color="primary" class="items-center"/> 
      </q-card-section>
      <q-card-section v-if="canSyncWithGithub">
        <div class="row justify-center q-gutter-md clickable" v-close-popup>Skip Synchronization</div>
      </q-card-section>
      <GithubSyncDialog v-if="isShowGithubSyncPanel" :projectName="project.projectName"  @created="reloadAfterSync"/>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import GithubSyncDialog from '../components/github/GithubSyncDialog.vue';
import { useProjectStore } from 'src/pinia/modules/project';
import api from '../api/backend-api';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { mapActions, mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  components: {
    GithubSyncDialog,
  },
  props: {
    parentGetProjects: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  data() {
    return {
      submitting: false,
      project: {
        projectName: '',
        description: '',
        visibility: 2,
        // isOpen: true,
        showAllTrees: true,
        exerciseMode: false,
      },
      creatDialog: true,
      progress: 0,
      isShowSyncBtn: false,
      isShowGithubSyncPanel: false,
      synchronized:'',
    };
  },
  computed: {
    ...mapState(useUserStore, ['username', 'loggedWithGithub']),
    canSyncWithGithub(){
      return this.loggedWithGithub && this.isShowSyncBtn && !this.isShowGithubSyncPanel;
    }
  },
  methods: {
    ...mapActions(useProjectStore, ['resetAnnotationFeatures']),
    /**
     * Handle project submission by creating form data and sending to backend
     *
     * @returns void
     */
    onSubmit() {
      this.submitting = true;
      this.resetAnnotationFeatures();
      // this.$store.dispatch('config/resetAnnotationFeatures'); // reset annotationFeature object
      const data = {
        ...this.project,
        username: this.username,
      };
      api
        .createProject(data)
        .then(() => {
          this.parentGetProjects();
          this.submitting = false;
          if (this.loggedWithGithub) {
            this.progress = 0.4;
            this.isShowSyncBtn = true;
          }
          else {
           this.closeDialog();
          }
          notifyMessage({
           message: `${this.project.projectName} uploaded and created.`,
          });
        })
        .catch((error) => {
          notifyError({ error });
          this.submitting = false;
        });
    },
    reloadAfterSync() {
      this.creatDialog = false;
      this.parentGetProjects();
      this.$emit('created');
    },

    closeDialog() {
       this.creatDialog = false;
       this.$emit('created');
    }

  },
});
</script>
<style scoped lang="stylus">
.clickable:hover {
  cursor: pointer;
  color: blue;
}
</style>
