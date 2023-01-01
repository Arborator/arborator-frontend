<template>
  <q-page class="full-width row wrap" style="padding-top: 240px; padding-bottom: 80px">
    <div ref="words" class="q-pa-none full-width">
      <!-- <div class="row" dense v-for="(sent, i) in transcriptions['original']" :key="i"> -->
      <div v-for="(sent, i) in mytrans" :key="i" class="row" dense>
        <div :class="(viewAllTranscriptions ? 'col-2' : 'col-6') + ' row q-pa-none'">
          <span class="line-number" dense> {{ i + 1 }} </span>
          <q-badge v-if="speakers[i] && speakers[i] == 'L1'" :label="speakers[i]" dense outline style="height: 3px" color="primary" rounded />
          <q-badge
            v-if="speakers[i] && speakers[i] != 'L1' && speakers[i] != 'L0'"
            :label="speakers[i]"
            dense
            outline
            style="height: 3px"
            :color="'purple-' + (8 - parseInt(speakers[i].slice(-1), 10))"
            rounded
          />

          <span v-for="(wordInfo, j) in timedTokens[i]" :key="j" class="q-pa-none">
            <!-- {{t[1]/1000}} -->
            <q-chip
              v-if="parseInt(wordInfo[2], 10) / 1000 < ct"
              size="md"
              color="white"
              text-color="black"
              clickable
              dense
              class="q-pa-none"
              @click="wordclicked(wordInfo)"
            >
              {{ wordInfo[0] }}
            </q-chip>
            <q-chip
              v-else-if="parseInt(wordInfo[1]) / 1000 <= ct && parseInt(wordInfo[2], 10) / 1000 >= ct"
              square
              size="md"
              clickable
              dense
              class="q-pa-none current"
              @click="wordclicked(wordInfo)"
            >
              {{ wordInfo[0] }}
            </q-chip>
            <q-chip v-else size="md" color="white" text-color="primary" clickable dense class="q-pa-none" @click="wordclicked(wordInfo)">
              {{ wordInfo[0] }}
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

        <div v-if="isLoggedIn" :class="(viewAllTranscriptions ? 'col-3' : 'col-6') + ' q-pa-none'">
          <q-input
            v-if="speakers[i] && (speakers[i] == 'L1' || speakers[i] == 'L0')"
            v-model="mytrans[i]"
            style="background-color: #27693031"
            dense
            filled
            square
          >
          </q-input>
          <q-input
            v-if="speakers[i] && speakers[i] != 'L1' && speakers[i] != 'L0'"
            v-model="mytrans[i]"
            style="background-color: #4a276954"
            dense
            filled
            square
          >
          </q-input>
        </div>

        <!-- ADMIN TABLE : OTHER ANNOTATORS: -->
        <template v-if="viewAllTranscriptions" class="col-8">
          <template v-for="(transcription, username) in transcriptions" :key="username">
            <div
              v-if="username !== 'original' && username !== 'new proposal' && JSON.stringify(segments[username]) !== JSON.stringify(mytrans)"
              class="col q-pa-none"
            >
              <span>
                <q-btn v-if="segments[username][i] !== mytrans[i]" round dense flat icon="west" @click="moveToInputField(username, i)"> </q-btn>
                <span v-for="(part, index) in diffsegments[username][i]" :key="index" style="padding: 0px; margin: 0px">
                  <span v-if="part.added" style="color: green; padding: 0px; margin: 0px">
                    {{ part.value }}
                  </span>
                  <span v-else-if="part.removed" style="color: red; padding: 0px; margin: 0px"
                    >▼<q-tooltip>{{ part.value }}</q-tooltip></span
                  >
                  <span v-else style="color: dark-grey; padding: 0px; margin: 0px">
                    {{ part.value }}
                  </span>
                </span>
              </span>
            </div>
          </template>
        </template>
      </div>
      <!-- meta table: -->

      <template v-if="isAdmin && viewAllTranscriptions && !isLoading">
        <div v-for="(meta, i) in metaFormat" :key="-i - 1" class="row meta-row" dense>
          <!-- <div class="row justify-evenly" dense v-if="isLoggedIn"> -->
          <!-- empty column under the original: -->
          <div class="col-2 row q-pa-none"></div>
          <!-- meta names: -->
          <div class="col-3 row q-pa-none meta-label">
            <span class="meta-text"> {{ meta.label }} </span>
            <q-space />
          </div>
          <!-- columns by reviewers: -->
          <template v-for="(transcription, username) in transcriptions" class="col-8">
            <div
              v-if="username !== 'original' && username !== 'new proposal' && JSON.stringify(segments[username]) !== JSON.stringify(mytrans)"
              :key="username"
              class="col row q-pa none"
            >
              <span class="meta-value meta-text">{{ transcription[meta.value] }}</span>
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

      <!-- column headers: -->
      <div class="q-pa-none full-width">
        <div v-if="isLoggedIn" class="row justify-evenly" dense>
          <div :class="(viewAllTranscriptions ? 'col-2' : 'col-6') + '  q-pa-none'">
            <q-badge> original </q-badge>
            <br />
            <q-btn color="primary" size="xs" round icon="visibility" @click="openSentenceDlg('original')">
              <q-tooltip> See sentence segmentation </q-tooltip>
            </q-btn>
            <q-btn color="primary" size="xs" round icon="east" @click="moveAllToInputField('original')">
              <q-tooltip> copy original transcription into your column </q-tooltip>
            </q-btn>
          </div>
          <div :class="(viewAllTranscriptions ? 'col-3' : 'col-6') + ' q-pa-none'">
            <q-badge color="secondary"> {{ viewAllTranscriptions ? 'new proposal' : username }} </q-badge>

            <template v-for="(tt, un) in transcriptions" :key="un">
              <q-badge
                v-if="un !== 'original' && un !== 'new proposal' && un !== username && JSON.stringify(segments[un]) === JSON.stringify(mytrans)"
                color="primary"
                class="q-ml-md"
              >
                {{ un }}
              </q-badge>
            </template>

            <br />
            <q-btn color="secondary" size="xs" round icon="visibility" @click="openSentenceDlg('new proposal')">
              <q-tooltip> See sentence segmentation </q-tooltip>
            </q-btn>
          </div>
          <template v-if="viewAllTranscriptions" class="col-8">
            <template v-for="(transcription, username) in transcriptions" :key="username">
              <div
                v-if="username !== 'original' && username !== 'new proposal' && JSON.stringify(segments[username]) !== JSON.stringify(mytrans)"
                class="col q-pa-none"
              >
                <q-badge> {{ viewAllTranscriptions || wasSaved ? username : 'original' }} </q-badge>
                <br />
                <q-btn color="primary" size="xs" round icon="visibility" @click="openSentenceDlg(username)">
                  <q-tooltip> See sentence segmentation </q-tooltip>
                </q-btn>
                <q-btn color="primary" size="xs" round icon="west" @click="moveAllToInputField(username)">
                  <q-tooltip> copy transcription by {{ username }} into your column </q-tooltip>
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
        <div>
          <q-btn
            round
            dense
            flat
            icon="save"
            :disable="isLoading || !isLoggedIn || !title || !monodia || !accent || !story || !sound"
            @click="save()"
          />
          <q-tooltip>Fill out the form and save</q-tooltip>
        </div>
        <q-space />
        <q-btn
          v-if="viewAllTranscriptions"
          round
          dense
          flat
          icon="cloud_download"
          @click="
            setExportSampleName();
            exportConllDlg = true;
          "
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
              <q-option-group v-model="selectedUsers" :options="users" type="checkbox"></q-option-group>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn v-close-popup no-caps label="Export complete table" color="primary" text-color="white" @click="exportTextTable()"></q-btn>
            <q-btn
              v-close-popup
              no-caps
              :disable="selectedUsers.length == 0"
              label="Export CoNLL"
              color="primary"
              text-color="white"
              @click="exportConll()"
            ></q-btn>
            <q-btn v-close-popup label="Cancel" color="primary" text-color="white"> </q-btn>
            <q-toggle v-model="newsentsplit" label="new sentence split" />
          </q-card-actions>
          <q-input v-model="exportSampleName" label="export sample name" />
        </q-card>
      </q-dialog>
    </q-page-sticky>

    <q-dialog v-model="showSentencesDlg" full-width class="row-grow">
      <q-card class="sentence-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Sentences of {{ showSentenceUser }}</div>
        </q-card-section>

        <div class="q-pa-md full-width">
          <q-table
            :rows="sentences"
            row-key="number"
            :rows-per-page-options="[0]"
            class="text-black"
            table-header-class="text-white bg-primary"
            flat
            bordered
          >
            <template #body-cell="props">
              <q-td :props="props" :class="getSentenceCellClass(props)">
                {{ props.value }}
              </q-td>
            </template>
          </q-table>
        </div>

        <q-card-actions align="right">
          <q-chip dense>
            <q-avatar color="primary" text-color="white">{{ totTokens }}</q-avatar>
            tokens
          </q-chip>
          <q-chip v-if="totNewTokens != totTokens" dense outline>
            <q-avatar color="primary" text-color="white">{{ totNewTokens }}</q-avatar>
            retokenized
          </q-chip>
          <q-chip dense>
            <q-avatar color="secondary" text-color="white">{{ totWords }}</q-avatar>
            words
          </q-chip>
          <q-chip v-if="totNewWords != totWords" dense outline>
            <q-avatar color="secondary" text-color="white">{{ totNewWords }}</q-avatar>
            retokenized words
          </q-chip>

          <q-space />
          <q-btn v-close-popup label="OK" color="primary" text-color="white"> </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { mapState } from 'pinia';
import { exportFile } from 'quasar';
import api from '../api/backend-api';
import { useUserStore } from 'src/pinia/modules/user';
import JSZip from 'jszip';
import { Change, diffWords } from 'diff';
import { useMainStore } from 'src/pinia';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { timed_tokens_t, transcription_t } from 'src/api/backend-types';

// type transcription_object_t = { source: 'original'; data: { transcription: timed_tokens_t } } | { source: 'user'; data: transcription_t };
interface transcriptions_t {
  [key: string]: transcription_t;
}

interface sentence_line_t {
  number: number;
  speaker: number | string;
  nrTokens: number;
  nrNewTokens: number;
  nrWords: number;
  nrNewWords: number;
  sentence: string;
}

type segments_t = { [key: string]: string[] };

import { defineComponent } from 'vue';

export default defineComponent({
  props: ['kprojectname', 'ksamplename'],
  data() {
    const transcriptions: transcriptions_t = {};
    // transcription is an object username -> {..., sound: "ok", story: "ok", ...[ [ "et", "du", "coup", … ],..., [...] ]
    const sound = '';
    const story = '';
    const accent = '';
    const monodia = '';
    const title = '';
    const segments: segments_t = {};
    const sentences: sentence_line_t[] = [];
    const users: { label: string; value: string }[] = [];
    const diffsegments: { [key: string]: Change[][] } = {};
    const mytrans: string[] = [];
    const speakers: string[] = [];
    const timedTokens: timed_tokens_t = [[]];
    return {
      timedTokens,
      sentences,
      totTokens: 0,
      totNewTokens: 0,
      totWords: 0,
      totNewWords: 0,
      segments,
      audioplayer: null,
      progcolor: 'black',
      mediaObject: '',
      waveWidth: 2500,
      canvwidth: 0,
      transcriptions,
      speakers,
      diffsegments,
      currentTime: -1,
      manualct: -1,
      viewAllTranscriptions: false,
      showSaved: false,
      sound,
      story,
      accent,
      monodia,
      title,
      mytrans,
      isLoading: false,
      wasSaved: true,
      exportConllDlg: false,
      newsentsplit: true,
      exportSampleName: '',
      users,
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
    };
  },

  computed: {
    ...mapState(useUserStore, ['isLoggedIn', 'username']),
    ...mapState(useMainStore, { isAdmin: 'isProjectAdmin' }),
    ct() {
      return this.manualct;
    },
    canPlayLine() {
      return (this.audioplayer as any).error === null;
    },
  },
  watch: {},

  created() {
    this.mediaObject = `api/klang/projects/${this.kprojectname}/samples/${this.ksamplename}/mp3`;
    this.waveWidth = window.innerWidth;
  },

  async mounted() {
    this.audioplayer = (this.$refs.player as any).audio;
    (this.$refs.player as any).audio.ontimeupdate = () => this.onTimeUpdate();
    document.title = `Klang: ${this.ksamplename}`;
    await this.getSampleData();
  },
  methods: {
    singleLine2WordList(line: string, language: string | null = null) {
      if (language === 'French') {
        line = line.replace('’', "'");
        line = line.replace(/-ce|-ci|-là|-je|-tu|-t-il|-il|-t-elle|-elle|-t-ils|-ils|-t-elles|-elles|-on/gi, ' $&');
        line = line.replace(/[,;:!?./()*]+/gi, ' $& '); // added space behind for these characters
        line = line.replace(/[§]+/gi, ' $&'); // kept only the § with only space in front
        line = line.replace(/[']+/gi, '$& '); // kept only the ' with only space behind
        line = line.replace(/"/gi, ' " ');
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
    },
    lines2WordList(lines: string[], language: string | null = null) {
      if (language == null) language = 'French';
      const wlines = lines.map((line) => {
        return this.singleLine2WordList(line, language);
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
          this.setSampleDataOneTranscription(response.data);
          this.populateSegmentsForAll();
          this.wasSaved = true;

          notifyMessage({
            message: 'The information was successfully saved.',
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

    openSentenceDlg(username: string) {
      this.showSentenceUser = username;
      this.showSentencesDlg = true;
      const trans = this.makeTranscription(username, true) as string[][];
      this.sentences = trans.map((sent, i) => ({
        number: i + 1,
        speaker: sent[0][3],
        nrTokens: sent.length,
        nrNewTokens: this.singleLine2WordList(sent.map((q) => q[0]).join(' ')).length,
        nrWords: sent.map((q) => q[0]).reduce((acc, t) => (this.isRealWord(t as string) ? (acc as number) + 1 : acc), 0),
        nrNewWords: this.singleLine2WordList(sent.map((q) => q[0]).join(' '))
          .map((q) => q[0])
          .reduce((acc, t) => (this.isRealWord(t as string) ? (acc as number) + 1 : acc), 0),
        sentence: sent.map((q) => q[0]).join(' '),
      }));
      this.totTokens = this.sentences.reduce((acc, t) => acc + t.nrTokens, 0) as number;
      this.totNewTokens = this.sentences.reduce((acc, t) => acc + t.nrNewTokens, 0) as number;
      this.totWords = this.sentences.reduce((acc, t) => acc + t.nrWords, 0) as number;
      this.totNewWords = this.sentences.reduce((acc, t) => acc + t.nrNewWords, 0) as number;
    },
    getSentenceCellClass(props: { row: sentence_line_t }) {
      // for styling of the sentence table: too long sentences get colored in deep orange
      let cellclass = '';
      if (props.row.speaker === 'L1' || props.row.speaker === 'L0') cellclass += 'text-black';
      else cellclass = `${cellclass}text-teal-${8 - parseInt((props.row.speaker as string).slice(-1), 10)}`;
      if (props.row.nrTokens > 22) cellclass += ` bg-deep-orange-${Math.min(14, Math.round((props.row.nrTokens - 20) / 5))}`;
      return cellclass;
    },

    adminchanged() {
      this.getSampleData();
    },

    popultateSegmentsForAnnotator(annotator: string) {
      if (annotator === 'original') {
        throw Error('This function is only for annotator (not for the original timedtokens)');
      }

      const annotatorTranscriptionText = this.transcriptions[annotator].transcription;
      if (annotatorTranscriptionText.length === 0) {
        this.segments[annotator] = JSON.parse(JSON.stringify(this.segments.original));
      } else {
        this.segments[annotator] = this.transcriptions[annotator].transcription.map((sent) => sent.reduce((acc, t) => `${acc + t} `, ''));
      }
      this.users.push({ label: annotator, value: annotator });
      if (!this.viewAllTranscriptions) {
        this.wasSaved = false;
      }

      // Nasty debugging for the bug that inserts empty list in transcriptions
      if (this.segments[annotator].length !== this.segments.original.length) {
        notifyError({
          error:
            ' Your transcription is corrupted, can you notify the admin of this website please ? ERROR CODE GITHUB : 105 : https://github.com/Arborator/arborator-frontend/issues/105',
          timeout: 25000,
        });
        // segments = segments.filter((segment) => segment.length > 0); // <- Kim and Kirian : Quick debugging to make it printing, but we don't know if it will then break all the saving logic !!!!
      }
      this.diffsegments[annotator] = this.segments[annotator].map((sent, i) => diffWords(this.segments.original[i] || 'FINISHED !!', sent));
    },

    populateSegmentsForOriginal() {
      if (this.timedTokens.length === 0) {
        throw Error('TimedTokens is null, see why original content is broken');
      }
      this.segments.original = this.timedTokens.map((sent) => sent.reduce((acc, t) => `${acc + t[0]} `, ''));
      this.users.push({ label: 'original', value: 'original' });
    },

    populateSegmentsForAll() {
      this.segments = {};
      this.users = [];
      this.selectedUsers = [];
      this.populateSegmentsForOriginal();
      for (const annotator in this.transcriptions) {
        if (Object.prototype.hasOwnProperty.call(this.transcriptions, annotator)) {
          if (annotator !== 'original') {
            this.popultateSegmentsForAnnotator(annotator);
          }
        }
      }
    },

    setMetaInfo() {
      if (!this.viewAllTranscriptions) {
        this.mytrans = this.segments[this.username];
        this.sound = this.transcriptions[this.username].sound;
        this.story = this.transcriptions[this.username].story;
        this.accent = this.transcriptions[this.username].accent;
        this.monodia = this.transcriptions[this.username].monodia;
        this.title = this.transcriptions[this.username].title;
      }
    },

    moveToInputField(annotator: string, line: number) {
      this.mytrans[line] = this.segments[annotator][line];
    },
    moveAllToInputField(annotator: string) {
      for (let line = 0; line < this.timedTokens.length; line += 1) {
        this.mytrans[line] = this.segments[annotator][line];
      }
    },
    setExportSampleName() {
      this.exportSampleName = this.camelize(this.title || this.ksamplename);
    },
    tokTrans2quadrupleTrans(newTrans: any[][], origTrans: any[][]) {
      // takes a list of lists of tokens and adds start, end, and speaker information from the original transcription
      var quadTrans: any[][] = [];
      for (let line = 0; line < origTrans.length; line += 1) {
        // looping over the original lines
        const origLine = origTrans[line];
        var transLine: (string | number)[][] = [];
        const minMS = origLine[0][1];
        const maxMS = origLine[origLine.length - 1][2];
        const realWordsCount = newTrans[line].reduce((acc, t) => (this.isRealWord(t as string) ? (acc as number) + 1 : acc), 0) as number;
        const msec = (parseInt(maxMS, 10) - parseInt(minMS, 10)) / realWordsCount;
        let startMS = 0;
        let endMS = 0;
        for (let ti = 0; ti < newTrans[line].length; ti += 1) {
          const isRealWord = this.isRealWord(newTrans[line][ti] as any);
          if (isRealWord) endMS += msec;
          transLine[ti] = [
            newTrans[line][ti] as string,
            Math.round(parseFloat(minMS) + startMS),
            Math.round(parseFloat(minMS) + endMS),
            this.speakers[line],
          ];
          if (isRealWord) startMS += msec;
        }
        quadTrans.push(transLine);
      }
      return quadTrans;
    },
    makeNewTranscription(transcription: any[][]) {
      const flattranscription = transcription.reduce((accumulator, value) => accumulator.concat(value), []);
      const newtranscription = [];
      let newsent = [];
      let bracksent = [];
      let inBracket = false;
      let inHm = false;
      let lastspeaker = null;
      for (let word = 0; word < flattranscription.length; word += 1) {
        if (Object.prototype.hasOwnProperty.call(flattranscription, word)) {
          let [w, b, e, s] = flattranscription[word];
          const [nw, nb, ne, ns] = word + 1 < flattranscription.length ? flattranscription[word + 1] : [0, 0, 0, 0];

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
          if (this.isEndOfSent(w) && !inBracket && !inHm && !(nw === '"' && ns === s)) {
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
      if (bracksent.length > 0) newtranscription.push(bracksent);
      if (newsent.length > 0) newtranscription.push(newsent);
      // console.log(1111, 'newtranscription', newtranscription);
      // console.log(1111, 'bracksent', bracksent);
      // console.log(1111, 'newsent', newsent);
      return newtranscription;
      // transcription = newtranscription;
    },
    makeTranscription(annotator: string, newsentsplit: boolean) {
      const originalTranscription = this.deepCopy(this.timedTokens);
      const nrLines = originalTranscription.length;
      var userTranscription: any[][] = [];
      if (annotator == 'original') {
        for (let line = 0; line < nrLines; line += 1) {
          const transLine = originalTranscription[line];
          var newLine = []; //(string | number)[];
          for (let ti = 0; ti < transLine.length; ti += 1) {
            newLine.push([...transLine[ti], this.speakers[line]]);
          }
          userTranscription.push(newLine);
        }
      } else if (annotator == 'new proposal') {
        userTranscription = this.tokTrans2quadrupleTrans(this.lines2WordList(this.mytrans), originalTranscription);
      } else {
        userTranscription = this.tokTrans2quadrupleTrans(this.transcriptions[annotator].transcription, originalTranscription);
      }
      if (newsentsplit) {
        return this.makeNewTranscription(userTranscription);
      }
      return userTranscription;
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
            notifyMessage({
              message: 'Exported conlls successfully.',
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
    exportTextTable() {
      const fileName = `${this.ksamplename}_${this.exportSampleName}.tsv`;
      var lines = [];
      lines.push(['original', ...Object.keys(this.transcriptions).filter((user) => this.transcriptions[user].transcription.length > 0)].join('\t'));

      var transs = Object.keys(this.transcriptions)
        .map((user) => this.transcriptions[user].transcription)
        .filter((trans) => trans.length > 0)
        .map((trans) =>
          trans.map((t) =>
            t
              .join(' ')
              .replace(/\s+/gm, ' ')
              .replace(/(^ +| +$)/gm, '')
          )
        );
      for (var i = 0; i < transs[0].length; i++) {
        lines.push([this.segments.original[i], ...transs.map((row) => row[i])].join('\t'));
      }
      const status = exportFile(fileName, lines.join('\n'));
      if (status) {
        notifyMessage({
          message: 'Exported transcription tsv successfully.',
          icon: 'done',
        });
      } else {
        notifyError({
          error: 'Browser denied file download...',
        });
      }
    },

    isRealWord(word: string) {
      // console.log(1111, word, typeof word);
      return word.match(/\w+/);
    },
    isEndOfSent(word: string) {
      // console.log(7777, word, typeof word);
      return word.match(/[.!?…]/);
    },
    camelize(text: string) {
      text = text.replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
      return text.substr(0, 1).toLowerCase() + text.substr(1);
    },
    generateConllText(transcription: any) {
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
      await useUserStore().checkSession();
      this.isLoading = true;
      await api
        .getOriginalTranscription(this.kprojectname, this.ksamplename)
        .then((response) => {
          this.timedTokens = response.data.tokens;
          this.speakers = response.data.speakers;
          if (this.isLoggedIn) {
            if (!this.isAdmin) {
              api
                .getTranscription(this.kprojectname, this.ksamplename, this.username)
                .then((response2) => {
                  this.setSampleDataOneTranscription(response2.data);
                  this.isLoading = false;
                  this.addUserTranscriptionIfNoExist();
                  this.populateSegmentsForAll();
                  this.setMetaInfo();
                })
                .catch((error) => {
                  notifyError({ error });
                  this.isLoading = false;
                });
            } else {
              api
                .getAllTranscription(this.kprojectname, this.ksamplename)
                .then((response2) => {
                  this.setSampleDataAllTranscription(response2.data);
                  this.isLoading = false;
                  this.addUserTranscriptionIfNoExist();
                  this.populateSegmentsForAll();
                  this.setMetaInfo();
                })
                .catch((error) => {
                  notifyError({ error });
                  this.isLoading = false;
                });
            }
          }
          console.log(1111, this.speakers);
        })

        .catch((error) => {
          notifyError({ error });
        });
    },

    setSampleDataOneTranscription(transcriptionBackend: transcription_t) {
      if (
        transcriptionBackend &&
        Object.keys(transcriptionBackend).length !== 0 &&
        Object.getPrototypeOf(transcriptionBackend) === Object.prototype &&
        transcriptionBackend !== null &&
        transcriptionBackend !== undefined
      ) {
        this.transcriptions[transcriptionBackend.user] = transcriptionBackend;
      }
    },

    setSampleDataAllTranscription(transcriptionsBackend: transcription_t[]) {
      for (const transcription of transcriptionsBackend) {
        const userId = transcription.user;
        this.transcriptions[userId] = transcription;
      }
    },

    addUserTranscriptionIfNoExist() {
      if (!this.transcriptions[this.username] && this.isLoggedIn) {
        const transcription: string[][] = [];
        this.transcriptions[this.username] = {
          user: this.username,
          transcription,
          accent: '',
          monodia: '',
          sound: '',
          title: '',
          story: '',
        };
      }
    },

    wordclicked(triple: any) {
      (this.audioplayer as any).currentTime = triple[1] / 1000; // -.5;
      this.manualct = triple[1] / 1000;
      (this.audioplayer as any).play();
      if (this.manualct > this.lineEnd) this.isPlayingLine = -1;
    },

    handlePlayLine(index: number) {
      if (this.isPlayingLine === index) {
        (this.audioplayer as any).pause();
        this.isPlayingLine = -1;
      } else {
        this.isPlayingLine = index;
        const line = this.timedTokens[index];
        const { length } = line;
        this.lineStart = parseInt(line[0][1], 10) / 1000;
        this.lineEnd = parseInt(line[length - 1][2], 10) / 1000;
        (this.audioplayer as any).currentTime = this.lineStart;
        (this.audioplayer as any).play();
      }
    },

    onTimeUpdate() {
      if (this.$refs.player === null) return;
      // console.log(this.audioplayer.currentTime);
      if (this.isPlayingLine >= 0) {
        if ((this.audioplayer as any).currentTime > this.lineEnd) (this.audioplayer as any).currentTime = this.lineStart;
      }
      this.currentTime = (this.audioplayer as any).currentTime;
      this.manualct = this.currentTime;
      const current = (this.$refs.words as HTMLElement).querySelector('.current');
      if (current) {
        current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    },

    deepCopy<T>(obj: T): T {
      return JSON.parse(JSON.stringify(obj));
    },
  },
});
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

.meta-row {
  background-color: #4a2769;
  color: white;
}

.meta-text {
  margin-left: 10px;
}

.special-column {
  margin-left: 10px;
  /* width: 500px;
  min-width: 500px;
  max-width: 500px; */
}
</style>
