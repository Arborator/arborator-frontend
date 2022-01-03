<template>
  <q-page class="full-width row wrap" style="padding-top: 230px; padding-bottom: 80px">
    <div class="q-pa-none full-width" ref="words">
      <!-- <div class="row" dense v-for="(sent, i) in transcriptions['original']" :key="i"> -->
      <div class="row justify-evenly" dense v-for="(sent, i) in mytrans" :key="i">
        <span class="line-number" dense> {{ i + 1 }} </span>
        <q-badge v-if="speakers[i] && speakers[i] == 'L1'" :label="speakers[i]" dense outline style="height: 3px" color="primary" rounded />
        <q-badge
          v-if="speakers[i] && speakers[i] != 'L1'"
          :label="speakers[i]"
          dense
          outline
          style="height: 3px"
          :color="'teal-' + (8 - speakers[i].slice(-1))"
          rounded
        />

        <div class="col row q-pa-none">
          <span class="q-pa-none" v-for="(t, j) in transcriptions['original'][i]" :key="j">
            <!-- {{t[1]/1000}} -->
            <q-chip v-if="t[2] / 1000 < ct" size="md" color="white" text-color="black" clickable dense @click="wordclicked(t)" class="q-pa-none">
              {{ t[0] }}
            </q-chip>
            <q-chip
              v-else-if="t[1] / 1000 <= ct && t[2] / 1000 >= ct"
              square
              size="md"
              clickable
              dense
              @click="wordclicked(t)"
              class="q-pa-none current"
            >
              {{ t[0] }}
            </q-chip>
            <q-chip v-else size="md" color="white" text-color="primary" clickable dense @click="wordclicked(t)" class="q-pa-none">
              {{ t[0] }}
            </q-chip>
          </span>
          <q-space />
          <q-btn
            v-if="viewAllTranscriptions && segments.original[i] !== mytrans[i]"
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
            flat
            :icon="isPlayingLine == i ? 'pause' : 'replay'"
            color="primary"
            @click="handlePlayLine(i)"
            v-if="canPlayLine"
            class="line-play"
            size="sm"
          >
            <q-tooltip> Click to play the sentence </q-tooltip>
          </q-btn>

          <q-separator spaced />
        </div>
        <div class="col q-pa-none" v-if="isLoggedIn">
          <div class="col q-pa-none">
            <q-input class="special-column" dense filled square v-model="mytrans[i]"> </q-input>
          </div>
        </div>
        <!-- ADMIN TABLE : OTHER ANNOTATORS -->
        <template v-if="viewAllTranscriptions">
          <template v-for="(transcription, username) in transcriptions" :key="username">
            <div class="col q-pa-none" v-if="username !== 'original' && JSON.stringify(segments[username]) !== JSON.stringify(mytrans)">
              <span>
                <q-btn v-if="segments[username][i] !== mytrans[i]" round dense flat icon="west" @click="moveToInputField(username, i)"> </q-btn>
                <span v-for="(part, index) in diffsegments[username][i]" style="padding: 0px; margin: 0px" :key="index">
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
        <div class="row meta-row" dense v-for="(meta, i) in metaFormat" :key="-i - 1">
          <!-- <div class="row justify-evenly" dense v-if="isLoggedIn"> -->
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span class="line-number" dense> </span>
          <div class="col row q-pa-none"></div>
          <div class="col row q-pa-none meta-label">
            <span class="meta-text"> {{ meta.label }} </span>
            <q-space />
          </div>
          <template v-for="(transcription, username) in transcriptions">
            <div
              class="col row q-pa none"
              :key="username"
              v-if="username !== 'original' && JSON.stringify(segments[username]) !== JSON.stringify(mytrans)"
            >
              <span class="meta-value meta-text">{{ transcription[meta.value] }}</span>
            </div>
          </template>
        </div>
      </template>
    </div>
    <q-page-sticky position="top" expand class="bg-white text-primary shadow-2" style="z-index: 999">
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
        played-line-color="#4a2769"
        noplayed-line-color="#15a700"
      >
      </av-waveform>
      <div class="q-pa-none full-width">
        <div class="row justify-evenly" dense v-if="isLoggedIn">
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <div class="col q-pa-none">
            <q-badge> original </q-badge>
            <br />
            <q-btn color="primary" size="xs" @click="openSentenceDlg('original')" round icon="visibility">
              <q-tooltip> See sentence segmentation </q-tooltip>
            </q-btn>
          </div>
          <!-- <q-space /> -->
          <!-- <div class="col"></div> -->
          <!-- <div class="col q-pa-none" v-if="viewAllTranscriptions"> -->
          <div class="col q-pa-none">
            <q-badge color="secondary"> {{ viewAllTranscriptions ? 'new proposal' : username }} </q-badge>
            <br />
            <q-btn
              color="secondary"
              size="xs"
              @click="openSentenceDlg(viewAllTranscriptions ? 'new proposal' : username, true)"
              round
              icon="visibility"
            >
              <q-tooltip> See sentence segmentation </q-tooltip>
            </q-btn>
          </div>
          <template v-if="viewAllTranscriptions">
            <template v-for="(transcription, username) in transcriptions" :key="username">
              <div class="col q-pa-none" v-if="username !== 'original' && JSON.stringify(segments[username]) !== JSON.stringify(mytrans)">
                <q-badge> {{ viewAllTranscriptions || wasSaved ? username : 'original' }} </q-badge>
                <br />
                <q-btn color="primary" size="xs" @click="openSentenceDlg(username)" round icon="visibility">
                  <q-tooltip> See sentence segmentation </q-tooltip>
                </q-btn>
              </div>
            </template>
          </template>
        </div>
      </div>
    </q-page-sticky>
    <q-page-sticky position="bottom" expand class="bg-white text-primary">
      <q-toolbar class="shadow-5">
        <q-toggle
          v-model="viewAllTranscriptions"
          label="view all transcriptions"
          left-label
          v-if="isAdmin"
          @input="adminchanged"
          :disable="isLoading"
        />
        <q-toggle v-else v-model="viewAllTranscriptions" label="View diffs" left-label :disable="isLoading" />
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
          :options="['unintelligible', 'non-native', 'native', 'French', 'Parisian']"
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
          :disable="isLoading || !isLoggedIn || !title || !monodia || !accent || !story || !sound"
        />
        <q-space />
        <q-btn
          round
          dense
          flat
          icon="cloud_download"
          @click="
            setExportSampleName();

            exportConllDlg = true;
          "
          :disable="!viewAllTranscriptions"
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
              <q-option-group :options="users" type="checkbox" v-model="selectedUsers"></q-option-group>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="Export" color="primary" text-color="white" @click="exportConll()" v-close-popup></q-btn>
            <q-btn label="Cancel" color="primary" text-color="white" v-close-popup> </q-btn>
            <q-toggle v-model="newsentsplit" label="new sentence split" />
          </q-card-actions>
          <q-input v-model="exportSampleName" label="export sample name" />
        </q-card>
      </q-dialog>
    </q-page-sticky>

    <q-dialog v-model="showSentencesDlg">
      <q-card class="sentence-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Sentences of {{ showSentenceUser }}</div>
        </q-card-section>

        <div class="q-pa-md full-width">
          <q-table
            :rows="sentences"
            row-key="number"
            :rows-per-page-options="[0]"
            class="text-primary"
            table-header-class="text-white bg-primary"
            flat
            bordered
          >
            <template v-slot:body-cell="props">
              <q-td :props="props" :class="getSentenceCellClass(props)">
                {{ props.value }}
              </q-td>
            </template>
          </q-table>
        </div>

        <q-card-actions align="right">
          <q-btn label="OK" color="primary" text-color="white" v-close-popup> </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
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
.sentence-dialog {
  min-width: 90vh;
}

.q-table tbody td {
  white-space: normal !important;
}

.float-right {
  margin-left: auto;
}

.meta-label {
  font-weight: 700;
  font-size: 15px;
  background-color: #276930;
}
.meta-text {
  margin-left: 10px;
}
.meta-row {
  background-color: #4a2769;
  color: white;
}

.special-column {
  background-color: #27693031;
  margin-left: 10px;
  /* width: 500px;
  min-width: 500px;
  max-width: 500px; */
}
</style>
<script>
import Vue from 'vue';
import AudioVisual from 'vue-audio-visual';
import diffWords from 'diff';
import { mapGetters } from 'vuex';
import { exportFile } from 'quasar';
import Store from '../store/index';
import api from '../boot/backend-api';
import app from '../App.vue';

const JSZip = require('jszip');
const Diff = require('diff');

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
      newsentsplit: true,
      exportSampleName: '',
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
      showSentencesDlg: false,
      showSentenceUser: 'Original',
      sentences: [],
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
  watch: {},
  methods: {
    lines2WordList(lines, language) {
      if (language == null) language = 'French';
      const wlines = lines.map((line) => {
        if (language === 'French') {
          line = line.replace('’', "'");
          line = line.replace(/-ce|-ci|-là|-je|-tu|-t-il|-il|-t-elle|-elle|-t-ils|-ils|-t-elles|-elles|-on/gi, ' $&');
          line = line.replace(/[,;:!?./§"()*]+/gi, ' $&');
          line = line.replace(/["'()]+/gi, '$& ');
          line = line.replace(/\s+/, ' ');
          line = line.replace("aujourd' hui", "aujourd'hui");
          line = line.replace("quelqu' un", "quelqu'un");
        }
        line.split(/\s+/);
        let words = line.split(/\s+/);
        words = words.filter((word) => word !== '');
        if (words.length === 0) {
          // TODO: check if this is necessary
          words.push('');
        }
        return words;
      });
      return wlines;
    },

    save() {
      this.isLoading = true;
      const trans = this.lines2WordList(this.mytrans);
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
            message: 'The information was successfully saved.',
            position: 'top-right',
            color: 'green',
            icon: 'done',
          });
          this.isLoading = false;
        },
        (error) => {
          this.$store.dispatch('notifyError', {
            error,
          });
          this.isLoading = false;
        }
      );
    },

    openSentenceDlg(username, fromInput) {
      if (fromInput) {
        this.transcriptions[username].transcription = this.lines2WordList(this.mytrans); // , 'French'
      }
      this.showSentenceUser = username;
      this.showSentencesDlg = true;
      const trans = this.makeTranscription(username, true);
      this.sentences = trans.map((sent, i) => ({
        number: i + 1,
        speaker: sent[0][3],
        length: sent.length,
        sentence: sent.map((q) => q[0]).join(' '),
      }));
    },
    getSentenceCellClass(props) {
      // for styling of the sentence table: too long sentences get colored in deep orange
      let cellclass = '';
      if (props.row.speaker === 'L1') cellclass += 'text-primary';
      else cellclass = `${cellclass}text-teal-${8 - props.row.speaker.slice(-1)}`;
      if (props.row.length > 22) cellclass += ` bg-deep-orange-${Math.round((props.row.length - 20) / 5)}`;
      return cellclass;
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
        // Nasty debugging for the bug that inserts empty list in transcriptions
        if (segments.length !== original.length) {
          this.$store.dispatch('notifyError', {
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
    setExportSampleName() {
      this.exportSampleName = this.camelize(this.title || this.ksamplename);
    },
    makeTranscription(username, newsentsplit) {
      // from a list of lines, make quadruples: token, start, end, speaker
      // if newsentsplit: redo sentences based on punctuation
      const isOriginal = username === 'original';
      let transcription = this.deepCopy(this.transcriptions[username]);
      const { original } = this.transcriptions;
      const lines = original.length;
      if (isOriginal) {
        // we just have to add the speaker as 4th element
        let line;

        for (line = 0; line < lines; line += 1) {
          const transLine = transcription[line];
          const transWords = transLine.length;
          let word;
          for (word = 0; word < transWords; word += 1) {
            transLine[word].push(this.speakers[line]);
          }
        }
      } else {
        // we have to build the quadruples
        transcription = transcription.transcription;
        let line;

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
            transLine[word] = [transLine[word], Math.round(parseFloat(minMS) + startMS), Math.round(parseFloat(minMS) + endMS), this.speakers[line]];
            if (isRealWord) startMS += msec;
          }
        }
      }
      if (newsentsplit) {
        const flattranscription = transcription.reduce((accumulator, value) => accumulator.concat(value), []);
        const newtranscription = [];
        let newsent = [];
        let bracksent = [];
        let inBracket = false;
        let inHm = false;
        let lastspeaker = null;
        for (const i in flattranscription) {
          if (flattranscription.hasOwnProperty(i)) {
            let [w, b, e, s] = flattranscription[i];
            if (w === '...') w = '…';
            if (w === '[') {
              inBracket = true;
              continue;
            }
            if (w === ']') {
              inBracket = false;
              continue;
            }
            if (lastspeaker && s !== lastspeaker && newsent.length > 0) {
              inHm = !inHm;
            }

            if (inBracket) bracksent.push([w, b, e, s === 'L1' ? 'L2' : 'L1']);
            else if (inHm) bracksent.push([w, b, e, s]);
            else newsent.push([w, b, e, s]);
            if (this.isEndOfSent(w) && !inBracket && !inHm) {
              newtranscription.push(newsent);
              newsent = [];
              if (bracksent.length > 0) {
                newtranscription.push(bracksent);
                bracksent = [];
              }
            }
            lastspeaker = s;
          }
        }
        transcription = newtranscription;
      }
      return transcription;
    },
    exportConll() {
      let index;
      const { length } = this.selectedUsers;
      const zip = new JSZip();

      for (index = 0; index < length; index += 1) {
        const username = this.selectedUsers[index];

        const conllFileName = `${this.ksamplename}_${this.exportSampleName}_${username}.conll`;
        let outputString = '';

        const transcription = this.makeTranscription(username, this.newsentsplit);
        outputString = this.generateConllText(transcription);
        zip.file(conllFileName, outputString);
      }
      zip
        .generateAsync({ type: 'blob' })
        .then((content) => {
          const zipFileName = `${this.ksamplename}_${this.exportSampleName}.zip`;
          const status = exportFile(zipFileName, content);
          if (status) {
            this.$q.notify({
              message: 'Exported conlls successfully.',
              position: 'top-right',
              color: 'green',
              icon: 'done',
            });
          } else {
            this.$store.dispatch('notifyError', {
              error: 'Browser denied file download...',
            });
          }
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
        });
    },

    isRealWord(word) {
      return word.match(/\w+/);
    },
    isEndOfSent(word) {
      return word.match(/[.\!\?…]/);
    },
    camelize(text) {
      text = text.replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
      return text.substr(0, 1).toLowerCase() + text.substr(1);
    },
    generateConllText(transcription) {
      let conllString = '';
      let line = 0;
      const lines = transcription.length;
      for (; line < lines; line += 1) {
        let word = 0;
        const words = transcription[line].length;
        // const lineText = transcription[line].reduce((acc, t) => acc + (t[0] !== '.' ? ' ' : '') + t[0], '');
        let singleConll = '';
        let text = '';
        for (; word < words; word += 1) {
          const conllWord = transcription[line][word];
          singleConll += `${word + 1}\t${conllWord[0]}\t${conllWord[0]}\t`;
          for (let index = 0; index < 6; index += 1) singleConll += '_\t';
          let spaceafter = '';
          // at least two characters and last character==apostrophe:
          if (conllWord[0].length > 1 && conllWord[0].slice(-1) === "'") spaceafter = '|SpaceAfter=No';
          // last token == ( or [:
          else if (['(', '['].includes(conllWord)) spaceafter = '|SpaceAfter=No';
          // next word exists and is a no-space-after punctuation
          else if (word + 1 < words && [',', '.', ')'].includes(transcription[line][word + 1][0].charAt(0))) spaceafter = '|SpaceAfter=No';
          // next word exists and is of form -x...
          else if (word + 1 < words && /-\w.*/.test(transcription[line][word + 1][0])) spaceafter = '|SpaceAfter=No';
          text += conllWord[0];
          if (spaceafter === '') text += ' ';
          singleConll += `AlignBegin=${conllWord[1]}|AlignEnd=${conllWord[2]}${spaceafter}\n`;
        }
        conllString += `# sent_id = ${this.ksamplename}_${this.exportSampleName}__${line + 1}\n`;
        conllString += `# text = ${text.trim()}\n`;
        conllString += `# sound_url = ${this.ksamplename}_${this.exportSampleName}.mp3\n`;
        conllString += `# speaker = ${transcription[line][0][3]}\n`;
        conllString += singleConll;
        conllString += '\n';
      }
      return conllString;
    },

    async getSampleData() {
      // wait to check if logged in
      await this.$store.dispatch('user/checkSession');

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
                  this.$store.dispatch('notifyError', { error });
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
                  this.$store.dispatch('notifyError', { error });
                  this.isLoading = false;
                });
            }
          } else {
            this.populateSegmentsForAll();
          }
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
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
