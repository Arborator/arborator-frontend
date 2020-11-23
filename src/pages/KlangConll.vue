<template>
  <q-page
    class="full-width row wrap justify-start items-start content-start"
    style="padding-top: 180px; padding-bottom: 80px"
  >
    <div class="q-pa-none full-width" ref="words">
      <div class="row" dense>
        <div class="col row q-pa-none"><q-space /></div>
        <template v-for="(u, anno) in conll">
          <div v-if="anno != 'original'" class="col q-pa-none">
            <q-badge> {{ (admin || wasSaved) ? anno : 'original' }} </q-badge>
          </div>
        </template>
      </div>
      <div 
        class="row" dense 
        v-for="(sent, i) in conll['original']" 
        :key="i"
      >
        <span class="line-number" dense>
          {{ i }}
        </span>
        <div class="col row q-pa-none">

          <span
            class="justify-end q-pa-none align-right"
            v-for="(t, j) in sent"
            :key="j"
          >
            <!-- {{t[1]/1000}} -->
            <q-chip
              v-if="t[1] / 1000 < ct"
              size="md"
              color="white"
              text-color="black"
              clickable
              dense
              @click="wordclicked(t)"
              class="q-pa-none"
            >
              {{ t[0] }}
            </q-chip>
            <q-chip
              v-else-if="t[1] / 1000 < ct + 0.4"
              square
              size="md"
              clickable
              dense
              @click="wordclicked(t)"
              class="q-pa-none current"
            >
              {{ t[0] }}
            </q-chip>
            <q-chip
              v-else
              size="md"
              color="white"
              text-color="primary"
              clickable
              dense
              @click="wordclicked(t)"
              class="q-pa-none"
            >
              {{ t[0] }}
            </q-chip>
          </span>
          <q-space />
          <q-separator spaced />
        </div>
        <template v-for="(u, anno) in conll">
          <div class="col q-pa-none" v-if="anno != 'original'">
            <div class="col q-pa-none">
              <q-input
                dense
                filled
                square
                v-model.lazy="mytrans[i]"
                v-if="!admin"
              >
              </q-input>
              <span v-else>
                <q-btn
                  v-if="diffsegments[anno][i].length != 1"
                  round
                  dense
                  flat
                  icon="west"
                  @click="takethis(anno, i)"
                >
                  <q-tooltip
                    >should be moving the text into the input field on the left.
                    but it's not working :(</q-tooltip
                  >
                </q-btn>
                <span
                  v-for="part in diffsegments[anno][i]"
                  style="padding: 0px; margin: 0px"
                >
                  <span
                    v-if="part.added"
                    style="color: green; padding: 0px; margin: 0px"
                  >
                    {{ part.value }}
                  </span>
                  <span
                    v-else-if="part.removed"
                    style="color: red; padding: 0px; margin: 0px"
                    >▼<q-tooltip>{{ part.value }}</q-tooltip></span
                  >
                  <span v-else style="color: grey; padding: 0px; margin: 0px">
                    {{ part.value }}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>
    <q-page-sticky
      position="top"
      expand
      class="bg-white text-primary"
      style="z-index: 999"
    >
      <av-waveform
        class="col-grow"
        ref="player"
        :audio-controls="true"
        :canv-top="true"
        :canv-width="waveWidth"
        :cors-anonym="true"
        :canv-height="120"
        :playtime-line-color="progcolor"
        playtime-text-bottom
        :progress-color="progcolor"
        :playtime-slider-color="progcolor"
        :playtime-line-width="5.8"
        :playtime-font-size="14"
        :playtime-slider-width="1"
        :audio-src="mediaObject"
        v-bind:currentTime.prop="currentTime"
      >
      </av-waveform>
    </q-page-sticky>
    <q-page-sticky position="bottom" expand class="bg-white text-primary">
      <q-toolbar>
        <q-toggle
          v-model="admin"
          label="admin"
          left-label
          v-if="isAdmin"
          @input="adminchanged"
          :disable="isLoading"
        />
        <q-space />
        <q-select
          no-caps
          dense
          v-model="sound"
          style="min-width: 200px"
          toggle-color="primary"
          :options="['unusable', 'bad', 'ok', 'good', 'hifi']"
          label="sound quality"
        />
        <q-space />
        <q-select
          no-caps
          dense
          v-model="story"
          style="min-width: 200px"
          toggle-color="primary"
          :options="['unintelligible', 'boring', 'ok', 'fun', 'hilarious']"
          label="story line"
        />
        <q-space />
        <q-select
          no-caps
          dense
          v-model="accent"
          style="min-width: 200px"
          toggle-color="primary"
          :options="[
            'unintelligible',
            'non-native',
            'native',
            'French',
            'Parisian',
          ]"
          label="accent"
        />
        <q-space />
        <q-select
          no-caps
          dense
          v-model="monodia"
          style="min-width: 200px"
          toggle-color="primary"
          :options="['monologue', 'interview', 'dialogue']"
          label="monologue/dialogue"
        />
        <q-space />
        <q-input square v-model="title" label="2 to 3 word title"> </q-input>
        <q-space />
        <q-btn round dense flat icon="save" 
          @click="save" 
          :disable="admin || isLoading || !isLoggedIn || 
                    !title || !monodia || !accent || !story || !sound" />
      </q-toolbar>
    </q-page-sticky>
  </q-page>
</template>
<style>
  .line-number {
    vertical-align: middle;
    line-height: 2.2;
    margin-left: 5px;
    margin-right: 3px;
  }
  .align-right {
    text-align: right;
  }
</style>
<script>
import Vue from "vue";
import api from "../boot/backend-api";
import AudioVisual from "vue-audio-visual";
import diffWords from "diff";
import Store from "../store/index";
import { mapGetters } from "vuex";

const Diff = require("diff");
Vue.use(AudioVisual);
export default {
  props: ["filename"],
  data() {
    return {
      audioplayer: null,
      progcolor: "black",
      mediaObject: null,
      waveWidth: 2500,
      canvwidth: 0,
      conll: {},
      segments: {},
      diffsegments: {},
      currentTime: -1,
      manualct: -1,
      admin: false,
      sound: null,
      story: null,
      accent: null,
      monodia: null,
      title: null,
      mytrans: [],
      isLoading: false,
      wasSaved: true
    };
  },
  computed: {
    ct: function () {
      return this.manualct;
    },
    ...mapGetters("user", ["isLoggedIn"]),
    isAdmin() {
      return this.$store.getters["user/getUserInfos"].super_admin;
    },
  },
  created() {
    this.mediaObject = "media/corpussamples/" + this.filename + 
       "/" + this.filename + ".mp3";
    this.waveWidth = window.innerWidth;
  },
  mounted() {
    this.audioplayer = this.$refs.player.audio;
    this.$refs.player.audio.ontimeupdate = () => this.onTimeUpdate();
    document.title = "Klang: " + this.filename;
    this.getConll();
  },
  methods: {
    btnClick(a, b) {
      this.manualct = 30;
    },
    save() {
      this.isLoading = true;
      const trans = this.mytrans.map((line) => {
        let words = line.split(" ");
        words = words.filter((word) => word !== "");
        return words;
      });
      const data = {
        transcription: trans,
        monodia: this.monodia,
        title: this.title,
        sound: this.sound,
        accent: this.accent,
        story: this.story
      }
      api.saveTranscription(this.filename, data).then(
        (response) => {
          const data = response.data.transcription;
          this.mytrans = data.map((line) => 
            line.reduce((total, word) => total + word + " ", "")
          );
          this.wasSaved = true;
          this.$q.notify({
            message: "The operation was successfully saved.",
            position: "top-right",
            color: "green",
            icon: "done",
          });
          this.isLoading = false;
        },
        (error) => {
          this.$store.dispatch("notifyError", { 
            error: error });
          this.isLoading = false;
        }
      );
    },
    adminchanged(adminvalue) {
      this.getConll();
    },

    makeSents() {
      this.segments = {};
      for (const annotator in this.conll) {
        const isOriginal = annotator == 'original';
        const original = !isOriginal ? this.segments['original'] : [];
        const conllSegment = isOriginal ? 
            this.conll[annotator] : this.conll[annotator]['transcription'];
        if(conllSegment.length != 0) {
          this.segments[annotator] = conllSegment.map(
            (sent) => sent.reduce(
              (acc, t) => acc + (isOriginal ? t[0] : t) + " ", ""
            )
          );
        } else {
          this.segments[annotator] = original;
          if(!this.admin) this.wasSaved = false;
        }
        const segments = this.segments[annotator];
        if(!isOriginal)
            this.diffsegments[annotator] = segments.map((sent, i) =>
              Diff.diffWords(original[i], sent)
            )
        if (annotator != "original" && !this.admin) {
          this.mytrans = segments;
          this.sound = this.conll[annotator].sound;
          this.story = this.conll[annotator].story;
          this.accent = this.conll[annotator].accent;
          this.monodia = this.conll[annotator].monodia;
          this.title = this.conll[annotator].title;
        }
      }
    },
    takethis(annotator, line) {
      // todo: not working. how to change the object so that it shows in the input fields above without reloading the page?
      this.segments["original"][line] = this.segments[annotator][line];
    },
    getConll() {
      this.isLoading = true;
      api
        .getConll(this.filename, this.admin)
        .then((response) => {
          this.conll = response.data;
          this.makeSents();
          this.isLoading = false;
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { 
            error: error });
          this.isLoading = false;
        });
    },
    wordclicked(triple) {
      this.audioplayer.currentTime = triple[1] / 1000; //-.5;
      this.manualct = triple[1] / 1000;
      this.audioplayer.play();
    },
    onTimeUpdate() {
      if (this.$refs.player == null) return;
      this.currentTime = this.$refs.player.audio.currentTime;
      this.manualct = this.currentTime;
      const current = this.$refs.words.querySelector(".current");
      if (current)
        current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
    },
  },
};
</script>
