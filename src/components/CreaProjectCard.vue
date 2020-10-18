<template>
  <q-card :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <q-bar>
      <q-space />
      <q-btn dense flat icon="close" v-close-popup>
        <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
      </q-btn>
    </q-bar>
    <q-card-section>
      <q-form
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
        id="createprojectform"
      >
        <q-input
          id="projectnameinput"
          filled
          v-model="project.projectName"
          label="Project name"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />
        <q-input
          id="descriptioninput"
          filled
          v-model="project.description"
          label="Description"
        />
        <div>
          <q-btn-toggle
            label="Visibility"
            glossy
            v-model="project.visibility"
            toggle-color="primary"
            :options="[
              { label: 'Private', value: 0 },
              { label: 'Visible', value: 1 },
              { label: 'Open', value: 2 },
            ]"
          />
        </div>
        <q-toggle v-model="project.showAllTrees" label="Show All Trees" />
        <q-toggle
          v-model="project.exerciseMode"
          :label="$t('createProjectCard').exerciseMode"
        />
        <div>
          <q-btn
            id="submitproject"
            type="submit"
            :loading="submitting"
            label="create"
            color="primary"
            class="q-mt-md"
            v-close-popup
          />
          <q-btn
            label="Reset"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import api from "../boot/backend-api";

export default {
  props: ["parentGetProjects"],
  data() {
    return {
      submitting: false,
      project: {
        projectName: "",
        description: "",
        visibility: 2,
        // isOpen: true,
        showAllTrees: true,
        exerciseMode: false,
      },
      attachment: { name: null, file: null },
    };
  },
  computed: {
    getUserInfos() {
      return this.$store.getters["user/getUserInfos"];
    },
  },
  methods: {
   
    /**
     * Handle project submission by creating form data and sending to backend
     *
     * @returns void
     */
    onSubmit() {
      this.submitting = true;
      this.$store.dispatch("config/resetAnnotationFeatures"); // reset annotationFeature object
      var data = {
        ...this.project,
        username: this.$store.getters["user/getUserInfos"].username,
      };
      api
        .createProject(data)
        .then((response) => {
          this.attachment.file = [];
          this.$props.parentGetProjects();
          this.submitting = false;
          this.$q.notify({
            message: `${this.project.projectName} uploaded and created.`,
          });
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
          this.submitting = false;
        });
    },
    /**
     * @TODO : Nothing yet ,to delete ?
     */
    onReset() {},
    /**
     * Attach the file when the event is triggerred
     *
     * @param {Event} event
     * @returns void
     */
    onFileChange(event) {
      this.attachment.file = event.target.files;
    },
  },
};
</script>
