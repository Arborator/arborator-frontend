<template>
  <q-page
    class="full-width row wrap justify-start items-start content-start"
    style="padding-top: 180px; padding-bottom: 80px"
  >
    <div class="q-pa-none full-width" ref="words">
      <div class="row" dense v-if="isLoggedIn">
        <div class="col row q-pa-none"><q-space /></div>
        <div class="col q-pa-none" v-if="admin"></div>
        <template v-for="(u, anno) in conll">
          <div v-if="anno != 'original'" class="col q-pa-none">
            <q-badge> {{ admin || wasSaved ? anno : "original" }} </q-badge>
          </div>
        </template>
      </div>
      <div class="row" dense v-for="(sent, i) in conll['original']" :key="i">
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
              v-if="t[2] / 1000 < ct"
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
              v-else-if="
                t[1] / 1000 <= ct
                && t[2] / 1000 >= ct
              "
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
          <q-btn
            v-if="admin && segments['original'][i] != mytrans[i]"
            round
            dense
            flat
            icon="east"
            class="float-right"
            @click="moveToInputField('original', i)"
          />
          <q-btn 
            dense
            round 
            icon="replay" 
            color="primary"
            @click="handlePlayLine(i)"
            v-if="canPlayLine"
            class="line-play"
            size="sm"
          >
            <q-tooltip>
              Click to play the sentence
            </q-tooltip>
          </q-btn>
          <q-separator spaced />
        </div>
        <div class="col q-pa-none" v-if="isLoggedIn">
          <div class="col q-pa-none">
            <q-input dense filled square v-model="mytrans[i]"> </q-input>
          </div>
        </div>
        <template v-for="(u, anno) in conll" v-if="admin">
          <div class="col q-pa-none" v-if="anno != 'original'">
            <span>
              <q-btn
                v-if="diffsegments[anno][i].length != 1"
                round
                dense
                flat
                icon="west"
                @click="moveToInputField(anno, i)"
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
        </template>
      </div>
      <template v-if="isAdmin && admin && !isLoading">
        <div class="row meta-row" dense v-for="(meta, i) in metaFormat" :key="-i - 1">
          <span class="line-number" dense> </span>
          <div class="col row q-pa-none"></div>
          <div class="col row q-pa-none">
            <span class="meta-label"> {{ meta.label }} </span>
            <q-space />
          </div>
          <template v-for="(user, anno) in conll">
            <div
              class="col row q-pa none"
              :key="anno"
              v-if="anno != 'original'"
            >
              <span class="meta-value">{{ user[meta.value] }}</span>
            </div>
          </template>
        </div>
      </template>
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
        <q-toggle
          v-model="admin"
          label="Saved Trancription"
          left-label
          v-else
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
        <q-btn
          round
          dense
          flat
          icon="save"
          @click="save()"
          :disable="
            isLoading ||
            !isLoggedIn ||
            !title ||
            !monodia ||
            !accent ||
            !story ||
            !sound
          "
        />
        <q-space />
        <q-btn
          round
          dense
          flat
          icon="cloud_download"
          @click="exportConllDlg = true"
          :disable="!admin"
        >
          <q-tooltip> Click to export conlls </q-tooltip>
        </q-btn>
      </q-toolbar>
      <q-dialog v-model="exportConllDlg">
        <q-card class="export-dialog">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Export Conlls</div>
          </q-card-section>

          <q-card-section>
            <div class="q-pa-md">
              <q-option-group
                :options="users"
                type="checkbox"
                v-model="selectedUsers"
              ></q-option-group>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              label="Export"
              color="primary"
              text-color="white"
              @click="exportConll()"
              v-close-popup
            ></q-btn>
            <q-btn
              label="Cancel"
              color="primary"
              text-color="white"
              v-close-popup
            >
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page-sticky>
  </q-page>
</template>
<style>
.line-number {
  vertical-align: middle;
  line-height: 2.2;
  margin-left: 5px;
  margin-right: 3px;
  width: 15px;
}

.line-play {
  margin-right: 5px;
  min-width: 2.6em !important;
}
.align-right {
  text-align: right;
}

.export-dialog {
  min-width: 300px;
}

.float-right {
  margin-left: auto;
}

.meta-label {
  font-weight: 700;
  font-size: 15px;
}

.meta-row {
  background-color: #3466a5;
  color: white;
}
</style>
<script>
import Vue from "vue";
import api from "../boot/backend-api";
import AudioVisual from "vue-audio-visual";
import diffWords from "diff";
import Store from "../store/index";
import { mapGetters } from "vuex";
import { exportFile } from "quasar";

const JSZip = require("jszip");
const Diff = require("diff");

Vue.use(AudioVisual);
export default {
  props: ["kprojectname", "ksamplename"],
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
      showSaved: false,
      sound: null,
      story: null,
      accent: null,
      monodia: null,
      title: null,
      mytrans: [],
      isLoading: false,
      wasSaved: true,
      exportConllDlg: false,
      users: [],
      selectedUsers: [],
      metaFormat: [
        {
          label: "Title",
          value: "title",
        },
        {
          label: "Story line",
          value: "story",
        },
        {
          label: "Accent",
          value: "accent",
        },
        {
          label: "Monologue/Dialogue",
          value: "monodia",
        },
        {
          label: "Sound quality",
          value: "sound",
        },
      ],
      currentLine: 0,
      isPlayingLine: false,
      lineStart: 0,
      lineEnd: 0
    };
  },

  computed: {
    ct: function () {
      return this.manualct;
    },

    ...mapGetters("user", ["isLoggedIn"]),

    isAdmin() {
      return this.$store.getters["user/isLoggedIn"];
    },

    username() {
      return this.$store.getters["user/getUserInfos"].username;
    },

    canPlayLine() {
      return this.audioplayer.error === null;
    }
  },

  created() {
    this.mediaObject =
      "api/klang/projects/" +
      this.kprojectname +
      "/samples/" +
      this.ksamplename +
      "/mp3";
    this.waveWidth = window.innerWidth;
  },

  mounted() {
    this.audioplayer = this.$refs.player.audio;
    this.$refs.player.audio.ontimeupdate = () => this.onTimeUpdate();
    document.title = "Klang: " + this.ksamplename;
    this.getSampleData();
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
        user: this.username,
        transcription: trans,
        monodia: this.monodia,
        title: this.title,
        sound: this.sound,
        accent: this.accent,
        story: this.story,
      };

      api
        .saveTranscription(
          this.kprojectname,
          this.ksamplename,
          this.username,
          data
        )
        .then(
          (response) => {
            this.setSampleData(response);
            this.makeSents();
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
              error: error,
            });
            this.isLoading = false;
          }
        );
    },

    adminchanged(adminvalue) {
      this.getSampleData();
    },

    makeSents() {
      this.segments = {};
      this.users = [];
      this.selectedUsers = [];
      for (const annotator in this.conll) {
        const isOriginal = annotator == "original";
        const original = !isOriginal ? this.segments["original"] : [];
        const conllSegment = isOriginal
          ? this.conll[annotator]
          : this.conll[annotator]["transcription"];
        if (conllSegment.length != 0) {
          this.segments[annotator] = conllSegment.map((sent) =>
            sent.reduce((acc, t) => acc + (isOriginal ? t[0] : t) + " ", "")
          );
          this.users.push({ label: annotator, value: annotator });
        } else {
          this.segments[annotator] = original;
          if (!this.admin) this.wasSaved = false;
        }
        const segments = this.deepCopy(this.segments[annotator]);
        if (!isOriginal)
          this.diffsegments[annotator] = segments.map((sent, i) =>
            Diff.diffWords(original[i], sent)
          );
        if (annotator == this.username && !this.admin) {
          this.mytrans = segments;
          this.sound = this.conll[annotator].sound;
          this.story = this.conll[annotator].story;
          this.accent = this.conll[annotator].accent;
          this.monodia = this.conll[annotator].monodia;
          this.title = this.conll[annotator].title;
        }
      }
    },

    deepCopy(object) {
      return JSON.parse(JSON.stringify(object));
    },

    moveToInputField(annotator, line) {
      Vue.set(this.mytrans, line, this.segments[annotator][line]);
    },

    exportConll() {
      let index;
      const length = this.selectedUsers.length;
      let zip = new JSZip();

      for (index = 0; index < length; index++) {
        const username = this.selectedUsers[index];
        const isOriginal = "original" === username;
        const conllFileName = username + ".conll";
        let outputString = "";
        let transcription = this.deepCopy(this.conll[username]);

        if (!isOriginal) {
          transcription = transcription["transcription"];
          let line;
          const original = this.conll["original"];
          const lines = original.length;
          for (line = 0; line < lines; line++) {
            let word;
            const originalLine = original[line];
            const originalWords = originalLine.length;
            const transLine = transcription[line];
            const transWords = transLine.length;
            const minMS = originalLine[0][1];
            const maxMS = originalLine[originalWords - 1][2];
            const realWordsCount = transLine.reduce(
              (acc, t) => this.isRealWord(t) ? acc + 1 : acc, 0);
            const msec = (maxMS  - minMS) / realWordsCount;
            let startMS = 0, endMS = 0;
            for(word = 0; word < transWords; word ++) {
              const isRealWord = this.isRealWord(transLine[word]);
              if(isRealWord) endMS += msec;
              transLine[word] = [
                transLine[word],
                Math.round(parseFloat(minMS) + startMS),
                Math.round(parseFloat(minMS) + endMS)
              ];
              if(isRealWord) startMS += msec;
            }
          }
        }
        outputString = this.generateConllText(transcription);
        zip.file(conllFileName, outputString);
      }
      zip
        .generateAsync({ type: "blob" })
        .then((content) => {
          const zipFileName = this.ksamplename + ".zip";
          const status = exportFile(zipFileName, content);
          if (status) {
            this.$q.notify({
              message: "Exported conlls successfully.",
              position: "top-right",
              color: "green",
              icon: "done",
            });
          } else {
            this.$store.dispatch("notifyError", {
              error: "Browser denied file download...",
            });
          }
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },

    isRealWord(word) {
      return word.match(/\w+/);
    },

    generateConllText(transcription) {
      let conllString = "";
      let line = 0;
      const lines = transcription.length;
      for (; line < lines; line++) {
        let word = 0;
        const words = transcription[line].length;
        const lineText = transcription[line].reduce(
          (acc, t) => acc + (t[0] != "." ? " " : "") + t[0],
          ""
        );
        conllString +=
          "# sent_id = " +
          this.ksamplename +
          ".intervals.conll__" +
          (line + 1) +
          "\n";
        conllString += "# text =" + lineText + "\n";
        conllString += "# sound_url = " + this.ksamplename + ".mp3\n";
        for (; word < words; word++) {
          const conllWord = transcription[line][word];
          conllString +=
            word + 1 + "\t" + conllWord[0] + "\t" + conllWord[0] + "\t";
          for (let index = 0; index < 6; index++) conllString += "_\t";
          conllString +=
            "AlignBegin=" + conllWord[1] + "|AlignEnd=" + conllWord[2] + "\n";
        }
        conllString += "\n";
      }
      return conllString;
    },

    async getSampleData() {
      // wait to check if logged in
      await this.$store.dispatch("user/checkSession");

      this.isLoading = true;
      this.conll = {};
      api
        .getOriginalConll(this.kprojectname, this.ksamplename)
        .then((response) => {
          this.conll["original"] = response.data;
          if (this.isLoggedIn) {
            if (!this.admin) {
              api
                .getTranscription(
                  this.kprojectname,
                  this.ksamplename,
                  this.username
                )
                .then((response) => {
                  this.setSampleData(response);
                  this.isLoading = false;
                })
                .catch((error) => {
                  this.$store.dispatch("notifyError", { error: error });
                  this.isLoading = false;
                });
            } else {
              api
                .getAllTranscription(this.kprojectname, this.ksamplename)
                .then((response) => {
                  this.setSampleData(response);
                  this.isLoading = false;
                })
                .catch((error) => {
                  this.$store.dispatch("notifyError", { error: error });
                  this.isLoading = false;
                });
            }
          } else {
            this.makeSents();
          }
        })
        .catch((error) => {
          this.$store.dispatch("notifyError", { error: error });
        });
    },

    setSampleData(response) {
      const data = response.data;
      if (Array.isArray(data)) {
        let index;
        for (index in data) {
          const user = this.makeValid(data[index]);
          this.conll[user.user] = user;
        }
      } else {
        const user = this.makeValid(data);
        this.conll[user.user] = user;
      }
      this.makeSents();
    },

    makeValid(data) {
      if (!data.user) {
        data.user = this.username;
        data.transcription = [];
      }
      return data;
    },

    wordclicked(triple) {
      this.audioplayer.currentTime = triple[1] / 1000; //-.5;
      this.manualct = triple[1] / 1000;
      this.audioplayer.play();
      if(this.manualct > this.lineEnd)
        this.isPlayingLine = false;
    },

    handlePlayLine(index) {
      const line = this.conll['original'][index];
      const length = line.length;
      this.isPlayingLine = true;
      this.lineStart = line[0][1] / 1000;
      this.lineEnd = (line[length - 1][2]) / 1000;
      this.audioplayer.currentTime = this.lineStart;
      this.audioplayer.play();
    },

    onTimeUpdate() {
      if (this.$refs.player == null) return;
      console.log(this.audioplayer.currentTime)
      if(this.isPlayingLine) {
        if(this.audioplayer.currentTime > this.lineEnd)
          this.audioplayer.currentTime = this.lineStart;
      }
      this.currentTime = this.audioplayer.currentTime;
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
