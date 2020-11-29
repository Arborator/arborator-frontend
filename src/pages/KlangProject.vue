<template>
  <q-page class="full-width row wrap justify-start items-start content-start">
    &nbsp;
    <q-chip
      label="Available Samples"
      color="primary"
      text-color="white"
      style="font-size: 15px"
    ></q-chip>
    <q-separator spaced />
    &nbsp;
    <div class="row q-col-gutter-md q-pa-lg">
      <div
        clickable
        v-ripple
        v-for="(f, i) in samples"
        :key="f"
        style="min-width: 300px"
      >
        <div>
          <q-btn
            no-caps
            color="primary"
            :label="i + '. ' + f"
            icon="music_note"
            :to="'/klang/' + $route.params.kprojectname + '/' + f"
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
import { mapGetters } from "vuex";
// import AudioVisual from 'vue-audio-visual'

// Vue.use(AudioVisual)
export default {
  data() {
    return {
      // audioplayer: null,
      samples: [],
      mediaObject: "/enregistrement_sonore_Richard_Matthieu.mp3",
      waveWidth: 2500,
      cc: false,
      currentTime: 121,
      canvwidth: 0,
    };
  },
  computed: {
    ...mapGetters("user", [
      "isLoggedIn"
    ])
  },
  created() {
    this.waveWidth = window.innerWidth;
  },
  mounted() {
    this.getProjectSamples();
  },
  methods: {
    /**
     * Retrieve conll files from backend
     *
     * @returns void
     */
    getProjectSamples() {
        const projectname = this.$route.params.kprojectname;
        api.getKlangProjectSamples(projectname)
            .then((response) => {
                this.samples = response.data;
            })
            .catch((error) => {
                this.$store.dispatch("notifyError", { error: error });
            });
    },
  },
};
</script>
