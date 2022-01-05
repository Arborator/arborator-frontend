<template>
  <q-card :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <q-bar>
      <q-space />
      <q-btn v-close-popup dense flat icon="close">
        <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
      </q-btn>
    </q-bar>
    <q-card-section>
      <q-form id="createprojectform" class="q-gutter-md" @submit="onSubmit" @reset="onReset">
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
        <div>
          <q-btn id="submitproject" v-close-popup type="submit" :loading="submitting" label="create" color="primary" class="q-mt-md" />
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { useProjectStore } from 'src/pinia/modules/project';
import api from '../api/backend-api';
import notifyError from 'src/utils/notify';
import { mapActions, mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['parentGetProjects'],
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
      attachment: { name: null, file: [] },
    };
  },
  computed: {
    ...mapState(useUserStore, ['getUserInfos']),
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
        username: this.getUserInfos.username,
      };
      api
        .createProject(data)
        .then(() => {
          this.attachment.file = [];
          this.$props.parentGetProjects();
          this.submitting = false;
          this.$q.notify({
            message: `${this.project.projectName} uploaded and created.`,
          });
        })
        .catch((error) => {
          notifyError({ error });
          this.submitting = false;
        });
    },
    onReset() {
      console.log('FIXME: not implemented yet');
    },
    onFileChange(event: any) {
      this.attachment.file = event.target.files;
    },
  },
});
</script>
