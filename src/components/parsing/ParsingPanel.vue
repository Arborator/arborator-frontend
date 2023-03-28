<template>
  <QCard>
    <div class="row q-pa-md">
      <div class="col">
        <p>Train Settings</p>
        <q-toggle v-model="parser.param.trainAll" label="Train on all files"/>
        <q-select
          :class="{ invisible: parser.param.trainAll }"
          v-model="parser.param.trainSamples"
          filled
          :options="allSamplesNames"
          multiple
          label="Files to parse"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-toggle v-model="parser.param.isCustomTrainingUser" label="Custom Training user"/>
        <q-select
          :class="{ invisible: !parser.param.isCustomTrainingUser }"
          v-model="parser.param.trainingUser"
          filled
          :options="allTreesFrom"
          label="Training user"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
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
      </div>
      <q-separator vertical inset class="q-mx-lg"/>
      <div class="col">
        <p>Parse Settings</p>
        <q-toggle v-model="parser.param.parseAll" label="Parse all files"/>
        <q-select
          :class="{ invisible: parser.param.parseAll }"
          v-model="parser.param.parseSamples"
          filled
          :options="allSamplesNames"
          multiple
          label="Files to parse"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-input :dense="true" v-model="parser.param.parserSuffix" label="Parser suffix (for parsed sentences)"
                 :hint="'Parsing will go under the name `parser' + parser.param.parserSuffix + '`'"/>
        <q-toggle v-model="parser.param.keepUpos" label="keep UPOS"/>
      </div>
      <q-separator vertical inset class="q-mx-lg"/>
      <div class="col">
        <div class="text-subtitle1 q-mt-xs">Begin parse:</div>
        <div class="text-subtitle5 q-mb-xs">estimated time = {{ estimatedTime }}mn</div>
        <div class="text-subtitle5 q-mb-xs">({{ trainingSentencesCount }} training sentences)</div>
        <q-btn v-close-popup color="primary" label="Begin" :loading="parser.taskStatus !== null" push size="sm"
               @click="parserTrainStart()"/>
        <!--        <q-btn v-if="parser.parsing" v-close-popup color="primary" label="Stop" push size="sm"-->
        <!--               @click="bootParserStop()"/>-->
      </div>
    </div>
  </QCard>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import api from '../../api/backend-api';
import {exportFile} from 'quasar';
import {sample_t} from 'src/api/backend-types';
import {parserType_t, timeEstimationCoefs_t} from 'src/types/main_types';
import {AxiosResponse} from "axios";
import {notifyMessage} from "src/utils/notify";
// https://github.com/Arborator/djangoBootParser/blob/master/estimated_time_100ep_logline.tsv
const timeEstimationCoefs: timeEstimationCoefs_t = {a: 0, b: 0.04, c: 0};

type taskType_t = "ASK_TRAINING" | "TRAINING" | "ASK_PARSING" | "PARSING"

type taskStatus_t = null | {
  taskType: taskType_t,
  taskTimeStarted: number,
  taskIntervalChecker: null | ReturnType<typeof setTimeout>,
}

interface parser_t {
  progress: string;
  taskStatus: taskStatus_t;
  sha512Fdname: string;
  timeInfo: string;
  param: {
    advancedSettings: boolean;
    keepUpos: boolean;
    isCustomTrainingUser: boolean;
    trainingUser: string;
    trainAll: boolean;
    parseAll: boolean;
    trainSamples: string[];
    parseSamples: string[];
    epochs: number;
    parserSuffix: string;
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
    parentGetProjectSamples: {
      type: Function as PropType<() => void>,
      required: true,
    }
  },

  data() {
    const parser: parser_t = {
      taskStatus: null,
      progress: 'bootstrap parsing',
      sha512Fdname: '',
      timeInfo: '',
      param: {
        advancedSettings: false,
        keepUpos: false,
        isCustomTrainingUser: false,
        trainingUser: '',
        trainAll: true,
        trainSamples: [],
        parseAll: true,
        parseSamples: [],
        epochs: 10,
        parserSuffix: '',
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
      const x = this.trainingSentencesCount;
      const time1epochs = (timeEstimationCoefs.a * Math.log(x + 1) + timeEstimationCoefs.b * x + timeEstimationCoefs.c) / 100;
      const time = time1epochs * this.parser.param.epochs;
      return Math.floor(Math.max(time, 2));
    },
  },
  methods: {
    parserTrainStart() {
      this.parser.taskStatus = {
        taskType: "ASK_TRAINING",
        taskTimeStarted: Date.now(),
        taskIntervalChecker: null,
      }

      const trainSampleNames = this.parser.param.trainAll ? this.allSamplesNames : this.parser.param.trainSamples;
      const trainUser = this.parser.param.isCustomTrainingUser ? this.parser.param.trainingUser : 'last';
      const maxEpoch = this.parser.param.epochs;
      api.parserTrainStart(this.$route.params.projectname as any as string, trainSampleNames, trainUser, maxEpoch).then(
        (response) => {
          if (response.data.status === "failure") {
            notifyMessage({message: "Training could not start : " + response.data.error, type: "negative"})
            this.clearCurrentTask()
          } else {
            notifyMessage({message: "Model training started"})
            const modelInfo = response.data.model_info;
            const taskIntervalChecker = setInterval(() => {
              setTimeout(this.parserTrainStatus(modelInfo) as any, 10);
            }, 20 * 1000);

            this.parser.taskStatus = {
              taskType: "TRAINING",
              taskTimeStarted: Date.now(),
              taskIntervalChecker,
            }
          }
        }
      )
    },
    parserTrainStatus(modelInfo: { project_name: string; model_id: string }) {
      api.parserTrainStatus(modelInfo).then(
        (response) => {
          if (response.data.status === "failure") {
            this.clearCurrentTask()
          } else if (response.data.data.ready == true) {
            this.clearCurrentTask()
            this.parserParseStart(modelInfo)
            notifyMessage({message: "Model training ended!"})
          } else if (this.parser.taskStatus && Date.now() - this.parser.taskStatus.taskTimeStarted > 1000 * 60) {
            this.clearCurrentTask()
          }
        }
      )
    },
    parserParseStart(modelInfo: { project_name: string; model_id: string }) {
      this.parser.taskStatus = {
        taskType: "ASK_PARSING",
        taskTimeStarted: Date.now(),
        taskIntervalChecker: null,
      }

      const toParseSamplesNames = this.parser.param.parseAll ? this.allSamplesNames : this.parser.param.parseSamples;
      const parserSuffix = this.parser.param.parserSuffix;

      api.parserParseStart(modelInfo, toParseSamplesNames).then(
        (response) => {
          if (response.data.status === "failure") {
            notifyMessage({message: "Parsing could not start : " + response.data.error, type: "negative"})
            this.clearCurrentTask()
          } else {
            notifyMessage({message: "Sentences parsing started"})
            const parseTaskId = response.data.parse_task_id;
            const taskIntervalChecker = setInterval(() => {
              setTimeout(this.parserParseStatus(modelInfo, parseTaskId, parserSuffix) as any, 10);
            }, 20 * 1000);

            this.parser.taskStatus = {
              taskType: "PARSING",
              taskTimeStarted: Date.now(),
              taskIntervalChecker,
            }
          }
        }
      )
    },
    parserParseStatus(modelInfo: { project_name: string; model_id: string }, parseTaskId: string, parserSuffix: string) {
      api.parserParseStatus(modelInfo, parseTaskId, parserSuffix).then(
        (response) => {
          if (response.data.status === "failure") {
            this.clearCurrentTask()
          } else if (response.data.data.ready == true) {
            this.clearCurrentTask()
            this.parentGetProjectSamples();
            notifyMessage({message: "Sentences parsing ended!"})
          } else if (this.parser.taskStatus && Date.now() - this.parser.taskStatus.taskTimeStarted > 1000 * 60) {
            this.clearCurrentTask()
          }
        }
      )
    },
    clearCurrentTask() {
      if (this.parser.taskStatus) {
        if (this.parser.taskStatus.taskIntervalChecker) {
          clearInterval(this.parser.taskStatus.taskIntervalChecker);
        }
        this.parser.taskStatus = null
      }
    }
  },
});
</script>
<style>
.invisible {
  visibility: hidden;
}
</style>
