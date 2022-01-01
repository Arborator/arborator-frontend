<template>
  <q-page class="full-width row wrap justify-start items-start content-start" style="padding-top: 180px; padding-bottom: 80px">
    <div ref="words" class="q-pa-none full-width">
      <div v-if="isLoggedIn" class="row" dense>
        <div class="col row q-pa-none"><q-space /></div>
        <!-- <div class="col q-pa-none" v-if="viewAllTranscriptions"> -->
        <div class="col q-pa-none">
          <q-badge> {{ viewAllTranscriptions ? 'new proposal' : username }} </q-badge>
        </div>
        <template v-if="viewAllTranscriptions">
          <template v-for="(transcription, username) in transcriptions" :key="username">
            <div v-if="username !== 'original'" class="col q-pa-none">
              <q-badge> {{ viewAllTranscriptions || wasSaved ? username : 'original' }} </q-badge>
            </div>
          </template>
        </template>
        <!-- </div> -->
      </div>
      <div v-for="(sent, i) in transcriptions['original']" :key="i" class="row" dense>
        <span class="line-number" dense>
          {{ i }}
        </span>
        <q-badge v-if="speakers[i] && speakers[i] == 'L1'" :label="speakers[i]" dense outline style="height: 3px" color="primary" rounded />
        <q-badge
          v-if="speakers[i] && speakers[i] != 'L1'"
          :label="speakers[i]"
          dense
          outline
          style="height: 3px"
          :color="'purple-' + speakers[i].slice(-1)"
          rounded
        />

        <div class="col row q-pa-none">
          <span v-for="(t, j) in sent" :key="j" class="justify-end q-pa-none align-right">
            <!-- {{t[1]/1000}} -->
            <q-chip v-if="t[2] / 1000 < ct" size="md" color="white" text-color="black" clickable dense class="q-pa-none" @click="wordclicked(t)">
              {{ t[0] }}
            </q-chip>
            <q-chip
              v-else-if="t[1] / 1000 <= ct && t[2] / 1000 >= ct"
              square
              size="md"
              clickable
              dense
              class="q-pa-none current"
              @click="wordclicked(t)"
            >
              {{ t[0] }}
            </q-chip>
            <q-chip v-else size="md" color="white" text-color="primary" clickable dense class="q-pa-none" @click="wordclicked(t)">
              {{ t[0] }}
            </q-chip>
          </span>
          <q-space />
          <q-btn
            v-if="viewAllTranscriptions && segments['original'][i] !== mytrans[i]"
            round
            dense
            flat
            icon="east"
            class="float-right"
            @click="moveToInputField('original', i)"
          />
          <q-btn
            v-if="canPlayLine"
            dense
            round
            flat
            :icon="isPlayingLine == i ? 'pause' : 'replay'"
            color="primary"
            class="line-play"
            size="sm"
            @click="handlePlayLine(i)"
          >
            <q-tooltip> Click to play the sentence </q-tooltip>
          </q-btn>

          <q-separator spaced />
        </div>
        <div v-if="isLoggedIn" class="col q-pa-none">
          <div class="col q-pa-none">
            <q-input v-model="mytrans[i]" dense filled square> </q-input>
          </div>
        </div>
        <!-- ADMIN TABLE : OTHER ANNOTATOR -->
        <template v-if="viewAllTranscriptions">
          <template v-for="(transcription, username) in transcriptions" :key="username">
            <div v-if="username !== 'original'" class="col q-pa-none">
              <span>
                <q-btn v-if="diffsegments[username][i].length !== 1" round dense flat icon="west" @click="moveToInputField(transcription, i)">
                </q-btn>
                <span v-for="(part, index) in diffsegments[username][i]" :key="index" style="padding: 0px; margin: 0px">
                  <span v-if="part.added" style="color: green; padding: 0px; margin: 0px">
                    {{ part.value }}
                  </span>
                  <span v-else-if="part.removed" style="color: red; padding: 0px; margin: 0px"
                    >▼<q-tooltip>{{ part.value }}</q-tooltip></span
                  >
                  <span v-else style="color: grey; padding: 0px; margin: 0px">
                    {{ part.value }}
                  </span>
                </span>
              </span>
            </div>
          </template>
        </template>
      </div>
      <template v-if="isAdmin && viewAllTranscriptions && !isLoading">
        <div v-for="(meta, i) in metaFormat" :key="-i - 1" class="row meta-row" dense>
          <span class="line-number" dense> </span>
          <div class="col row q-pa-none"></div>
          <div class="col row q-pa-none">
            <span class="meta-label"> {{ meta.label }} </span>
            <q-space />
          </div>
          <template v-for="(transcription, username) in transcriptions">
            <div v-if="username !== 'original'" :key="username" class="col row q-pa none">
              <span class="meta-value">{{ transcription[meta.value] }}</span>
            </div>
          </template>
        </div>
      </template>
    </div>
    <q-page-sticky position="top" expand class="bg-white text-primary shadow-2" style="z-index: 999">
      <av-waveform
        ref="player"
        class="col-grow"
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
        :current-time.prop="currentTime"
        played-line-color="#4a2769"
        noplayed-line-color="#15a700"
      >
      </av-waveform>
    </q-page-sticky>
    <q-page-sticky position="bottom" expand class="bg-white text-primary">
      <q-toolbar class="shadow-5">
        <q-toggle
          v-if="isAdmin"
          v-model="viewAllTranscriptions"
          label="view all transcriptions"
          left-label
          :disable="isLoading"
          @input="adminchanged"
        />
        <q-toggle v-else v-model="viewAllTranscriptions" label="View diffs" left-label :disable="isLoading" />
        <q-space />
        <q-select
          v-model="sound"
          no-caps
          dense
          style="min-width: 200px"
          toggle-color="primary"
          :options="['unusable', 'bad', 'ok', 'good', 'hifi']"
          label="sound quality"
        />
        <q-space />
        <q-select
          v-model="story"
          no-caps
          dense
          style="min-width: 200px"
          toggle-color="primary"
          :options="['unintelligible', 'boring', 'ok', 'fun', 'hilarious']"
          label="story line"
        />
        <q-space />
        <q-select
          v-model="accent"
          no-caps
          dense
          style="min-width: 200px"
          toggle-color="primary"
          :options="['unintelligible', 'non-native', 'native', 'French', 'Parisian']"
          label="accent"
        />
        <q-space />
        <q-select
          v-model="monodia"
          no-caps
          dense
          style="min-width: 200px"
          toggle-color="primary"
          :options="['monologue', 'interview', 'dialogue']"
          label="monologue/dialogue"
        />
        <q-space />
        <q-input v-model="title" square label="2 to 3 word title"> </q-input>
        <q-space />
        <q-btn
          round
          dense
          flat
          icon="save"
          :disable="isLoading || !isLoggedIn || !title || !monodia || !accent || !story || !sound"
          @click="save()"
        />
        <q-space />
        <q-btn round dense flat icon="cloud_download" :disable="!viewAllTranscriptions" @click="exportConllDlg = true">
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
              <q-option-group v-model="selectedUsers" :options="users" type="checkbox"></q-option-group>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn v-close-popup label="Export" color="primary" text-color="white" @click="exportConll()"></q-btn>
            <q-btn v-close-popup label="Cancel" color="primary" text-color="white"> </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page-sticky>
  </q-page>
</template>
<script>
import { mapGetters } from 'vuex';
import { mapActions } from 'pinia';
import { exportFile } from 'quasar';
import api from '../api/backend-api';
import { useUserStore } from 'src/pinia/modules/user';
import JSZip from 'jszip';
import Diff from 'diff';
// const JSZip = require('jszip');
// const Diff = require('diff');

export default {
  props: ['kprojectname', 'ksamplename'],
  data() {
    return {
      audioplayer: null,
      progcolor: 'black',
      mediaObject: null,
      waveWidth: 2500,
      canvwidth: 0,
      transcriptions: {},
      speakers: [],
      segments: {},
      diffsegments: {},
      currentTime: -1,
      manualct: -1,
      viewAllTranscriptions: false,
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
          label: 'Title',
          value: 'title',
        },
        {
          label: 'Story line',
          value: 'story',
        },
        {
          label: 'Accent',
          value: 'accent',
        },
        {
          label: 'Monologue/Dialogue',
          value: 'monodia',
        },
        {
          label: 'Sound quality',
          value: 'sound',
        },
      ],
      currentLine: 0,
      isPlayingLine: -1,
      lineStart: 0,
      lineEnd: 0,
    };
  },

  computed: {
    ct() {
      return this.manualct;
    },

    ...mapGetters('user', ['isLoggedIn']),

    isAdmin() {
      return this.$store.getters['klang/isAdmin'];
    },

    username() {
      return this.$store.getters['user/getUserInfos'].username;
    },

    canPlayLine() {
      return this.audioplayer.error === null;
    },
  },

  created() {
    this.mediaObject = `api/klang/projects/${this.kprojectname}/samples/${this.ksamplename}/mp3`;
    this.waveWidth = window.innerWidth;
  },

  mounted() {
    this.audioplayer = this.$refs.player.audio;
    this.$refs.player.audio.ontimeupdate = () => this.onTimeUpdate();
    document.title = `Klang: ${this.ksamplename}`;
    this.getSampleData();
  },

  methods: {
    // ...mapActions(useUserStore, 'checkSession'),
    btnClick(a, b) {
      // this.checkSession();
      this.manualct = 30;
    },

    save() {
      this.isLoading = true;

      const trans = this.mytrans.map((line) => {
        let words = line.split(' ');
        words = words.filter((word) => word !== '');
        if (words.length === 0) {
          words.push('');
        }
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

      api.saveTranscription(this.kprojectname, this.ksamplename, this.username, data).then(
        (response) => {
          this.setSampleData(response);
          this.populateSegmentsForAll();
          this.wasSaved = true;

          this.$q.notify({
            message: 'The operation was successfully saved.',
            position: 'top-right',
            color: 'green',
            icon: 'done',
          });
          this.isLoading = false;
        },
        (error) => {
          notifyError({
            error,
          });
          this.isLoading = false;
        }
      );
    },

    adminchanged(adminvalue) {
      this.getSampleData();
    },

    popultateSegmentsForAnnotator(annotator) {
      const isOriginal = annotator === 'original';
      const original = !isOriginal ? this.segments.original : [];
      const conllSegments = isOriginal ? this.transcriptions[annotator] : this.transcriptions[annotator].transcription;
      if (conllSegments.length !== 0) {
        this.segments[annotator] = conllSegments.map((sent) => sent.reduce((acc, t) => `${acc + (isOriginal ? t[0] : t)} `, ''));
        this.users.push({ label: annotator, value: annotator });
      } else {
        this.segments[annotator] = original;
        if (!this.viewAllTranscriptions) this.wasSaved = false;
      }

      let segments = this.deepCopy(this.segments[annotator]);
      if (!isOriginal) {
        // Nasty debegging for the bug that inserts empty list in transcriptions
        if (segments.length !== original.length) {
          notifyError({
            error:
              ' Your transcription is corrupted, can you notify the admin of this website please ? ERROR CODE GITHUB : 105 : https://github.com/Arborator/arborator-frontend/issues/105',
            timeout: 25000,
          });
          segments = segments.filter((segment) => segment.length > 0); // <- Kim and Kirian : Quick debugging to make it printing, but we don't know if it will then break all the saving logic !!!!
        }
        this.diffsegments[annotator] = segments.map((sent, i) => Diff.diffWords(original[i] || 'FINISHED !!', sent));
      }

      if (annotator === this.username && !this.viewAllTranscriptions) {
        this.mytrans = segments;
        this.sound = this.transcriptions[annotator].sound;
        this.story = this.transcriptions[annotator].story;
        this.accent = this.transcriptions[annotator].accent;
        this.monodia = this.transcriptions[annotator].monodia;
        this.title = this.transcriptions[annotator].title;
      }
    },

    populateSegmentsForAll() {
      this.segments = {};
      this.users = [];
      this.selectedUsers = [];
      this.popultateSegmentsForAnnotator('original');
      for (const annotator in this.transcriptions) {
        if (Object.prototype.hasOwnProperty.call(this.transcriptions, annotator)) {
          if (annotator !== 'original') {
            this.popultateSegmentsForAnnotator(annotator);
          }
        }
      }
    },

    deepCopy(object) {
      return JSON.parse(JSON.stringify(object));
    },

    moveToInputField(annotator, line) {
      this.mytrans[line] = this.segments[annotator][line];
    },

    exportConll() {
      let index;
      const { length } = this.selectedUsers;
      const zip = new JSZip();

      for (index = 0; index < length; index += 1) {
        const username = this.selectedUsers[index];
        const isOriginal = username === 'original';
        const conllFileName = `${username}.conll`;
        let outputString = '';
        let transcription = this.deepCopy(this.transcriptions[username]);

        if (!isOriginal) {
          transcription = transcription.transcription;
          let line;
          const { original } = this.transcriptions;
          const lines = original.length;
          for (line = 0; line < lines; line += 1) {
            let word;
            const originalLine = original[line];
            const originalWords = originalLine.length;
            const transLine = transcription[line];
            const transWords = transLine.length;
            const minMS = originalLine[0][1];
            const maxMS = originalLine[originalWords - 1][2];
            const realWordsCount = transLine.reduce((acc, t) => (this.isRealWord(t) ? acc + 1 : acc), 0);
            const msec = (maxMS - minMS) / realWordsCount;
            let startMS = 0;
            let endMS = 0;
            for (word = 0; word < transWords; word += 1) {
              const isRealWord = this.isRealWord(transLine[word]);
              if (isRealWord) endMS += msec;
              transLine[word] = [transLine[word], Math.round(parseFloat(minMS) + startMS), Math.round(parseFloat(minMS) + endMS)];
              if (isRealWord) startMS += msec;
            }
          }
        }
        outputString = this.generateConllText(transcription);
        zip.file(conllFileName, outputString);
      }
      zip
        .generateAsync({ type: 'blob' })
        .then((content) => {
          const zipFileName = `${this.ksamplename}.zip`;
          const status = exportFile(zipFileName, content);
          if (status) {
            this.$q.notify({
              message: 'Exported conlls successfully.',
              position: 'top-right',
              color: 'green',
              icon: 'done',
            });
          } else {
            notifyError({
              error: 'Browser denied file download...',
            });
          }
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    isRealWord(word) {
      return word.match(/\w+/);
    },

    generateConllText(transcription) {
      let conllString = '';
      let line = 0;
      const lines = transcription.length;
      for (; line < lines; line += 1) {
        let word = 0;
        const words = transcription[line].length;
        const lineText = transcription[line].reduce((acc, t) => acc + (t[0] !== '.' ? ' ' : '') + t[0], '');
        conllString += `# sent_id = ${this.ksamplename}.intervals.conll__${line + 1}\n`;
        conllString += `# text =${lineText}\n`;
        conllString += `# sound_url = ${this.ksamplename}.mp3\n`;
        for (; word < words; word += 1) {
          const conllWord = transcription[line][word];
          conllString += `${word + 1}\t${conllWord[0]}\t${conllWord[0]}\t`;
          for (let index = 0; index < 6; index += 1) conllString += '_\t';
          conllString += `AlignBegin=${conllWord[1]}|AlignEnd=${conllWord[2]}\n`;
        }
        conllString += '\n';
      }
      return conllString;
    },

    async getSampleData() {
      // wait to check if logged in
      await this.checkSession();
      // await this.$store.dispatch('user/checkSession');

      this.isLoading = true;
      this.transcriptions = {};
      api
        .getOriginalTranscription(this.kprojectname, this.ksamplename)
        .then((response) => {
          this.transcriptions.original = response.data.tokens;
          this.speakers = response.data.speakers;
          if (this.isLoggedIn) {
            if (!this.isAdmin) {
              api
                .getTranscription(this.kprojectname, this.ksamplename, this.username)
                .then((response2) => {
                  this.setSampleData(response2);
                  this.isLoading = false;
                })
                .catch((error) => {
                  notifyError({ error });
                  this.isLoading = false;
                });
            } else {
              api
                .getAllTranscription(this.kprojectname, this.ksamplename)
                .then((response2) => {
                  this.setSampleData(response2);
                  this.isLoading = false;
                })
                .catch((error) => {
                  notifyError({ error });
                  this.isLoading = false;
                });
            }
          } else {
            this.populateSegmentsForAll();
          }
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    setSampleData(response) {
      const { data } = response;
      if (Array.isArray(data)) {
        let index;
        for (index in data) {
          if (Object.prototype.hasOwnProperty.call(data, index)) {
            const user = this.makeValid(data[index]);
            this.transcriptions[user.user] = user;
          }
        }
        if (!this.transcriptions[this.username]) {
          this.transcriptions[this.username] = {
            user: this.username,
            transcription: [],
          };
        }
      } else {
        const user = this.makeValid(data);
        this.transcriptions[user.user] = user;
      }
      this.populateSegmentsForAll();
    },

    makeValid(data) {
      if (!data.user) {
        data.user = this.username;
        data.transcription = [];
      }
      return data;
    },

    wordclicked(triple) {
      this.audioplayer.currentTime = triple[1] / 1000; // -.5;
      this.manualct = triple[1] / 1000;
      this.audioplayer.play();
      if (this.manualct > this.lineEnd) this.isPlayingLine = -1;
    },

    handlePlayLine(index) {
      if (this.isPlayingLine === index) {
        this.audioplayer.pause();
        this.isPlayingLine = -1;
      } else {
        this.isPlayingLine = index;
        const line = this.transcriptions.original[index];
        const { length } = line;
        this.lineStart = line[0][1] / 1000;
        this.lineEnd = line[length - 1][2] / 1000;
        this.audioplayer.currentTime = this.lineStart;
        this.audioplayer.play();
      }
    },

    onTimeUpdate() {
      if (this.$refs.player === null) return;
      // console.log(this.audioplayer.currentTime);
      if (this.isPlayingLine >= 0) {
        if (this.audioplayer.currentTime > this.lineEnd) this.audioplayer.currentTime = this.lineStart;
      }
      this.currentTime = this.audioplayer.currentTime;
      this.manualct = this.currentTime;
      const current = this.$refs.words.querySelector('.current');
      if (current) {
        current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    },
  },
};
</script>

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
  background-color: #4a2769;
  color: white;
}
</style>
