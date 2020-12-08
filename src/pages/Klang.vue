<template>
  <q-page class="full-width row wrap justify-start items-start content-start">
    &nbsp;
    <q-chip
      label="Available Projects"
      color="primary"
      text-color="white"
      style="font-size: 15px"
    ></q-chip>
    <q-separator spaced />
    &nbsp;
    <div class="row q-col-gutter-md q-pa-lg">
      <div
        clickable
        v-for="(f, i) in projects"
        :key="f"
        style="min-width: 300px"
      >
        <div>
          <q-btn
            no-caps
            color="primary"
            :label="i + '. ' + f"
            icon="music_note"
            :to="'/klang/' + f"
          />
        </div>
      </div>
    </div>
    <q-separator spaced />
  </q-page>
</template>

<script>
import Vue from "vue";
import api from "../boot/backend-api";

export default {
  data() {
    return {
      projects: [],
    };
  },
  mounted() {
    this.getProjects();
  },
  methods: {
    /**
     * Retrieve conll files from backend
     *
     * @returns void
     */
    getProjects() {
      api
        .getKlangProjects()
        .then((response) => {
          this.projects = response.data;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
  },
};
</script>
