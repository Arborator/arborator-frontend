<template>
  <QCard>
    <div class="row q-pa-md">
      <div class="col">
        <p><b>General Settings</b></p>
        <div style="display: flex; flex-direction: column">
          <q-radio v-model="param.pipelineChoice" val="TRAIN_AND_PARSE" label="Train and Parse"/>
          <q-radio v-model="param.pipelineChoice" val="TRAIN_ONLY" label="Train Only"/>
          <q-radio v-model="param.pipelineChoice" val="PARSE_ONLY" label="Parse Only"/>
        </div>
      </div>
      <q-separator vertical inset class="q-mx-lg"/>
      <div v-show="param.pipelineChoice !== 'PARSE_ONLY'" class="col">
        <p><b>Train Settings</b></p>
        <q-toggle v-model="param.trainAll" label="Train on all files"/>
        <q-select
          :class="{ invisible: param.trainAll }"
          v-model="param.trainSamples"
          filled
          :options="allSamplesNames"
          multiple
          label="Files to parse"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-toggle v-model="param.isCustomTrainingUser" label="Custom Training user"/>
        <q-select
          :class="{ invisible: !param.isCustomTrainingUser }"
          v-model="param.trainingUser"
          filled
          :options="allTreesFrom"
          label="Training user"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-input
          v-model.number="param.epochs"
          type="number"
          label="epochs"
          min="3"
          max="300"
          filled
          style="max-width: 100px"
          :rules="[(val) => (val >= 3 && val <= 300) || 'Please use 3 to 300 epochs']"
        />
      </div>
      <q-separator v-show="param.pipelineChoice !== 'PARSE_ONLY'" vertical inset class="q-mx-lg"/>
      <div v-show="param.pipelineChoice !== 'TRAIN_ONLY'" class="col">
        <p><b>Parse Settings</b></p>
        <q-toggle v-model="param.parseAll" label="Parse all files"/>
        <q-select
          :class="{ invisible: param.parseAll }"
          v-model="param.parseSamples"
          filled
          :options="allSamplesNames"
          multiple
          label="Files to parse"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-input :dense="true" v-model="param.parserSuffix" label="Parser suffix (for parsed sentences)"
                 :hint="'Parsing will go under the name `parser' + param.parserSuffix + '`'"/>
<!--        <q-toggle v-model="param.keepUpos" label="keep UPOS"/>-->
      </div>
      <q-separator v-show="param.pipelineChoice !== 'TRAIN_ONLY'" vertical inset class="q-mx-lg"/>
      <div class="col">
        <p><b>Start Pipeline</b></p>
        <div class="text-subtitle5 q-mb-xs">estimated time = {{ estimatedTime }}mn</div>
        <div class="text-subtitle5 q-mb-xs">({{ trainingSentencesCount }} training sentences)</div>
        <q-btn v-close-popup color="primary" label="START" :loading="taskStatus !== null" push size="sm"
               @click="parserTrainStart()"/>
        <!--        <q-btn v-if="parsing" v-close-popup color="primary" label="Stop" push size="sm"-->
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
  param: {
    pipelineChoice: "TRAIN_AND_PARSE" | "TRAIN_ONLY" | "PARSE_ONLY";
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
    const data: parser_t = {
      taskStatus: null,
      progress: 'bootstrap parsing',
      param: {
        pipelineChoice: 'TRAIN_AND_PARSE',
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
    return data;
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
      if (this.param.trainAll) {
        return this.samples.map((sample) => sample.sentences).reduce((partialSum, a) => partialSum + a, 0);
      }
      return this.samples
        .filter((sample) => this.param.trainSamples.includes(sample.sample_name))
        .reduce((partialSum, sample) => partialSum + sample.sentences, 0);
    },
    estimatedTime() {
      const x = this.trainingSentencesCount;
      const time1epochs = (timeEstimationCoefs.a * Math.log(x + 1) + timeEstimationCoefs.b * x + timeEstimationCoefs.c) / 100;
      const time = time1epochs * this.param.epochs;
      return Math.floor(Math.max(time, 2));
    },
  },
  methods: {
    parserTrainStart() {
      this.taskStatus = {
        taskType: "ASK_TRAINING",
        taskTimeStarted: Date.now(),
        taskIntervalChecker: null,
      }

      const trainSampleNames = this.param.trainAll ? this.allSamplesNames : this.param.trainSamples;
      const trainUser = this.param.isCustomTrainingUser ? this.param.trainingUser : 'last';
      const maxEpoch = this.param.epochs;
      api.parserTrainStart(this.$route.params.projectname as any as string, trainSampleNames, trainUser, maxEpoch).then(
        (response) => {
          if (response.data.status === "failure") {
            notifyMessage({message: "Training could not start : " + response.data.error, type: "negative"})
            this.clearCurrentTask()
          } else {
            notifyMessage({message: "Model training started"})
            console.log("KK response.data.model_info", response.data.data.model_info)
            const modelInfo = response.data.data.model_info;
            const taskIntervalChecker = setInterval(() => {
              setTimeout(this.parserTrainStatus(modelInfo) as any, 10);
            }, 20 * 1000);

            this.taskStatus = {
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
          } else if (response.data.data.task_status === "READY") {
            this.clearCurrentTask()
            this.parserParseStart(modelInfo)
            notifyMessage({message: "Model training ended!"})
          } else if (this.taskStatus && Date.now() - this.taskStatus.taskTimeStarted > 1000 * 60) {
            this.clearCurrentTask()
          }
        }
      )
    },
    parserParseStart(modelInfo: { project_name: string; model_id: string }) {
      this.taskStatus = {
        taskType: "ASK_PARSING",
        taskTimeStarted: Date.now(),
        taskIntervalChecker: null,
      }

      const toParseSamplesNames = this.param.parseAll ? this.allSamplesNames : this.param.parseSamples;
      const parserSuffix = this.param.parserSuffix;

      api.parserParseStart(modelInfo, toParseSamplesNames).then(
        (response) => {
          if (response.data.status === "failure") {
            notifyMessage({message: "Parsing could not start : " + response.data.error, type: "negative"})
            this.clearCurrentTask()
          } else {
            notifyMessage({message: "Sentences parsing started"})
            const parseTaskId = response.data.data.parse_task_id;
            const taskIntervalChecker = setInterval(() => {
              setTimeout(this.parserParseStatus(modelInfo, parseTaskId, parserSuffix) as any, 10);
            }, 20 * 1000);

            this.taskStatus = {
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
          } else if (response.data.data.task_status === "READY") {
            this.clearCurrentTask()
            this.parentGetProjectSamples();
            notifyMessage({message: "Sentences parsing ended!"})
          } else if (this.taskStatus && Date.now() - this.taskStatus.taskTimeStarted > 1000 * 60 * 60 * 3) { // 3 hours
            this.clearCurrentTask()
          }
        }
      )
    },
    clearCurrentTask() {
      if (this.taskStatus) {
        if (this.taskStatus.taskIntervalChecker) {
          clearInterval(this.taskStatus.taskIntervalChecker);
        }
        this.taskStatus = null
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
