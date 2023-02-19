<template>
  <QCard>
    <div class="row q-pa-md">
      <div class="col">
        <q-toggle v-model="parser.param.trainAll" label="Train on all files" />
        <q-select
          :class="{invisible: parser.param.trainAll}"
          v-model="parser.param.trainSamples"
          filled
          :options="allSamplesNames"
          multiple
          label="Files to parse"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-toggle v-model="parser.param.parseAll" label="Parse all files" />
        <q-select
          :class="{invisible: parser.param.parseAll}"
          v-model="parser.param.parseSamples"
          filled
          :options="allSamplesNames"
          multiple
          label="Files to parse"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
      </div>
      <q-separator vertical inset class="q-mx-lg" />
      <div class="col">
        <q-toggle v-model="parser.param.isCustomTrainingUser" label="Custom user" />
        <q-select
          :class="{invisible: !parser.param.isCustomTrainingUser}"
          v-model="parser.param.trainingUser"
          filled
          :options="allTreesFrom"
          label="Training user"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-toggle v-model="parser.param.advancedSettings" label="Advanced Settings" />
        <q-select
          :class="{invisible: !parser.param.advancedSettings}"
          v-model="parser.param.type"
          :options="parser.param.options"
          label="parser type" stack-label />
        <q-toggle v-model="parser.param.keepUpos" label="keep UPOS" />
      </div>
      <q-separator vertical inset class="q-mx-lg" />
      <div class="col">
        <q-input
          v-model.number="parser.param.epochs"
          type="number"
          label="epochs"
          min="3"
          max="300"
          filled
          style="max-width: 100px"
          :rules="[(val) => (val >= 3 && val <= 300) || 'Please use 3 to 300 epochs']"
        />
        <div class="text-subtitle1 q-mt-xs">Begin parse:</div>
        <div class="text-subtitle5 q-mb-xs">estimated time = {{ estimatedTime }}mn</div>
        <div class="text-subtitle5 q-mb-xs">({{ trainingSentencesCount }} training sentences)</div>
        <q-btn v-close-popup color="primary" label="Begin" :loading="parser.parsing" push size="sm" @click="bootParserStart()" />
        <q-btn v-if="parser.parsing" v-close-popup color="primary" label="Stop" push size="sm" @click="bootParserStop()" />
      </div>
      <q-separator vertical inset class="q-mx-lg" />
      <div class="col">
        <div class="column">
          <div class="column q-gutter-md">
            <h6>Logs</h6>
            <div v-if="parser.parsing">
              {{ parser.progress }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </QCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import api from '../../api/backend-api';
import { exportFile } from 'quasar';
import { sample_t } from 'src/api/backend-types';
import { parserType_t, timeEstimationCoefs_t } from 'src/types/main_types';
// https://github.com/Arborator/djangoBootParser/blob/master/estimated_time_100ep_logline.tsv
const timeEstimationCoefs: timeEstimationCoefs_t = {
  kirParser: { a: 0, b: 0.02, c: 0 },
  hopsParser: { a: -0.887, b:  	0.09357, c: 5.329 },
  stanzaParser: { a: 0.59, b: 0.090, c: -0.14516 },
  trankitParser: { a: 1.406, b: 0.0432, c: -0.9326 },
  udifyParser: { a: 5.74049, b: 0.062179, c: 8.79224 },
};

interface parser_t {
  parsing: boolean;
  timer: any;
  progress: string;
  sha512Fdname: string;
  time: number;
  timeInfo: string;
  param: {
    advancedSettings: boolean;
    type: parserType_t;
    options: string[];
    keepUpos: boolean;
    isCustomTrainingUser: boolean;
    trainingUser: string;
    trainAll: boolean;
    parseAll: boolean;
    trainSamples: string[];
    parseSamples: string[];
    epochs: number;
    epochsTok: number;
  };
}

export default defineComponent({
  name: 'ParsingPanel',
  components: {},
  props: {
    samples: {
      type: Array as PropType<sample_t[]>,
      required: true,
    },
  },

  data() {
    const parser: parser_t = {
      parsing: false,
      timer: '',
      progress: 'bootstrap parsing',
      sha512Fdname: '',
      time: -1,
      timeInfo: '',
      param: {
        advancedSettings: false,
        type: 'kirParser',
        options: ['trankitParser', 'kirParser', 'hopsParser', 'udifyParser', 'stanzaParser'],
        keepUpos: true,
        isCustomTrainingUser: false,
        trainingUser: '',
        trainAll: true,
        trainSamples: [],
        parseAll: true,
        parseSamples: [],
        epochs: 10,
        epochsTok: 5,
      },
    };
    return {
      parser,
    };
  },
  computed: {
    allSamplesNames() {
      return this.samples.map((sample) => sample.sample_name);
    },
    allTreesFrom() {
      const allTreesFromWithDuplicate = this.samples.map((sample) => sample.treesFrom).reduce((a: string[], b: string[]) => [...a, ...b], []);
      // console.log(this.samples[0].treesFrom);
      // return [];
      return [...new Set(allTreesFromWithDuplicate)];
    },
    trainingSentencesCount() {
      if (this.parser.param.trainAll) {
        return this.samples.map((sample) => sample.sentences).reduce((partialSum, a) => partialSum + a, 0);
      }
      return this.samples
        .filter((sample) => this.parser.param.trainSamples.includes(sample.sample_name))
        .reduce((partialSum, sample) => partialSum + sample.sentences, 0);
    },
    estimatedTime() {
      const parserId = this.parser.param.type;
      const parserCoefs = timeEstimationCoefs[parserId];
      const x = this.trainingSentencesCount
      const time1epochs = (parserCoefs.a * Math.log(x + 1) + parserCoefs.b * x + parserCoefs.c)/100;
      const time = time1epochs * this.parser.param.epochs
      return Math.floor(Math.max(time, 0))
    },
  },
  methods: {
    exportConllError(info: any) {
      const filename = 'Error_in_train_files.txt';
      const status = exportFile(filename, info, 'text/plain;charset=UTF-8');
      if (status === true) {
        this.$q.notify({ message: `Error on dataset`, color: 'positive' });
      } else {
        this.$q.notify({ message: `Error when download error files: ${status}`, color: 'negative' });
      }
    },
    bootParserStop() {
      api
        .removeParseFolder(this.$route.params.projectname as string, this.parser.sha512Fdname)
        .then((response) => {
          // this.parser.progress = response.data.status;
          if (response.data.status.toLowerCase() !== 'ok') {
            throw new Error('Failed to stop parsing, please try latter');
          }
          this.parser.parsing = false;
          this.parser.timeInfo = '';
          this.parser.time = -1;
          // this.resetParsingProgress();
        })
        .catch((error) => {
          this.$q.notify({ message: `${error}`, color: 'negative' });
          return [];
        });
    },
    getProgress(fdname: string) {
      console.log(this.parser.timeInfo);
      api
        .bootParserResults(this.$route.params.projectname as string, this.parser.param.type, fdname)
        .then((response) => {
          // console.log('Progress: ', response.data);
          console.log('Progress_info: ', response.data.status, 'log_path: ', response.data.logPath);
          console.log(this.parser.parsing);
          this.parser.progress = response.data.status;
          if (this.parser.parsing === false) {
            this.resetParsingProgress();
          }
          if (this.parser.progress.toLowerCase() === 'error') {
            this.parser.parsing = false;
            this.resetParsingProgress();
            throw new Error('failed to train or parse');
          }
          if (this.parser.progress.toLowerCase() === 'fin') {
            // this.loadProjectData(); // TODO : make projectData in a pinia store

            this.parser.parsing = false;
            this.resetParsingProgress();
            this.exportScore(JSON.stringify(response.data.devScore));
            console.log(response.data.devScore);
          }
        })
        .catch((error) => {
          this.$q.notify({ message: `${error}`, color: 'negative' });
          this.parser.parsing = false;
          this.resetParsingProgress();
          return [];
        });
    },
    resetParsingProgress() {
      clearInterval(this.parser.timer as any);
      this.parser.timeInfo = '';
      this.parser.time = -1;
      this.parser.progress = 'bootstrap parsing';
    },
    exportScore(f1score: any) {
      const filename = this.parser.param.type.concat('f1_score.json');
      const status = exportFile(filename, f1score, 'application/json');
      console.log(status);
      if (status === true) {
        this.$q.notify({ message: `Score on dev set`, color: 'positive' });
      } else {
        this.$q.notify({ message: `Error when download score file: ${status}`, color: 'negative' });
      }
    },

    bootParserStart() {
      // TODO
      this.parser.parsing = true;

      const trainingFiles = this.parser.param.trainAll ? this.allSamplesNames : this.parser.param.trainSamples;
      const toParseNames = this.parser.param.parseAll ? 'ALL' : this.parser.param.parseSamples;
      const trainingUser = this.parser.param.isCustomTrainingUser ? this.parser.param.trainingUser : 'last';

      api
        .bootParserCustom(
          trainingFiles,
          this.$route.params.projectname as any,
          this.parser.param.type,
          this.parser.param.epochs,
          this.parser.param.keepUpos,
          toParseNames,
          trainingUser
        )
        .then((response) => {
          // this.table.selected = [];
          console.log(response);
          if (response.data.datasetStatus.toLowerCase() !== 'ok') {
            this.parser.parsing = false;
            throw new Error('Failed to prepare dataset');
          }
          if (response.data.parseStatus.toLowerCase() === 'done') {
            this.parser.parsing = false;
            throw new Error('Nothing new to train or parse');
          }
          this.parser.sha512Fdname = response.data.projectFolder;
          console.log(this.parser.sha512Fdname);
          this.parser.param.type = response.data.parserID;
          this.parser.time = response.data.time;
          if (this.parser.time > 0) {
            this.parser.timeInfo = ' Estimated time: '.concat(this.parser.time.toString()).concat(' (min)');
          }
          if (response.data.dataError) {
            console.log(response.data.dataError);
            this.exportConllError(response.data.dataError);
          }
        })
        .catch((error: any) => {
          this.$q.notify({ message: `${error}`, color: 'negative' });
          this.parser.parsing = false;
          this.parser.timeInfo = '';
          this.parser.time = -1;
          return [];
        });
      if (this.parser.parsing) {
        this.parser.timer = setInterval(() => {
          setTimeout(this.getProgress(this.parser.sha512Fdname) as any, 10);
        }, 20 * 1000) as any;
      }
    },
  },
});
</script>
<style>
  .invisible {
    visibility: hidden;
  }
</style>
