<template>
  <q-page class="full-width row wrap justify-start items-start content-start">
    &nbsp;
    <q-chip
      label="Available Conlls"
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
        v-for="(f, i) in conlls"
        :key="f"
        style="min-width: 300px"
      >
        <div>
          <q-btn
            no-caps
            color="primary"
            :label="i + '. ' + f"
            icon="music_note"
            :to="'klang/' + f"
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
      conlls: [],
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
    // is not logged in, then go back to previous page
    this.waitForCheckSession();
  },
  methods: {
    btnClick(a, b) {
      this.getAllConlls();
    },
    async waitForCheckSession() {
      try {
        await this.$store.dispatch('user/checkSession');
        if(!this.isLoggedIn)
          this.$router.replace('/');
        else
          this.getAllConlls();
      } catch {
        this.$router.replace('/');
      }
    },
    /**
     * Retrieve conll files from backend
     *
     * @returns void
     */
    getAllConlls() {
      api
        .getConlls()
        .then((response) => {
          this.conlls = response.data;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },
  },
};
</script>
