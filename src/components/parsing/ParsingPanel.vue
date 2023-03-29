<template>
  <QCard>
    <div class="row q-pa-md">
      <div class="col">
        <p><b>General Settings</b></p>
        <div style="display: flex; flex-direction: column">
          <q-option-group
            :disable="taskStatus !== null"
            :options="param.pipelineOptions"
            type="radio"
            v-model="param.pipelineChoice"
          />
        </div>
        <q-select
          :disable="taskStatus !== null"
          v-model="param.baseModel"
          filled
          :options="param.baseModelsOptions"
          :label="`Base Model for training or parsing`"
          style="max-width: 200px; min-width: 150px"
<!--          :rules="[()=>{-->
<!--            if (noSelectedBaseModelForParsingError()) {-->
<!--              return `OTOTOTOTO`-->
<!--            }-->
<!--          }]"-->
        />
      </div>
      <q-separator vertical inset class="q-mx-lg"/>
      <div v-show="param.pipelineChoice !== 'PARSE_ONLY'" class="col">
        <p><b>Train Settings</b></p>
        <q-toggle :disable="taskStatus !== null" v-model="param.trainAll" label="Train on all files"/>
        <q-select
          :disable="taskStatus !== null"
          :class="{ invisible: param.trainAll }"
          v-model="param.trainSamples"
          filled
          :options="allSamplesNames"
          multiple
          label="Files to parse"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-toggle :disable="taskStatus !== null" v-model="param.isCustomTrainingUser" label="Custom Training user"/>
        <q-select
          :disable="taskStatus !== null"
          :class="{ invisible: !param.isCustomTrainingUser }"
          v-model="param.trainingUser"
          filled
          :options="allTreesFrom"
          label="Training user"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-input
          :disable="taskStatus !== null"
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
        <q-toggle :disable="taskStatus !== null" v-model="param.parseAll" label="Parse all files"/>
        <q-select
          :disable="taskStatus !== null"
          :class="{ invisible: param.parseAll }"
          v-model="param.parseSamples"
          filled
          :options="allSamplesNames"
          multiple
          label="Files to parse"
          stack-label
          style="max-width: 200px; min-width: 150px"
        />
        <q-input :disable="taskStatus !== null" :dense="true" v-model="param.parserSuffix"
                 label="Parser suffix (for parsed sentences)"
                 :hint="'Parsing will go under the name `parser' + param.parserSuffix + '`'"/>
        <!--        <q-toggle v-model="param.keepUpos" label="keep UPOS"/>-->
      </div>
      <q-separator v-show="param.pipelineChoice !== 'TRAIN_ONLY'" vertical inset class="q-mx-lg"/>
      <div class="col">
        <p><b>Pipeline Summary</b></p>
        <div class="text-subtitle5 q-mb-xs">training sentences : {{ trainingSentencesCount }}</div>
        <div class="text-subtitle5 q-mb-xs">parsing sentences : {{ parsingSentencesCount }}</div>
        <div class="text-subtitle5 q-mb-xs">estimated time = {{ estimatedTime }}mn</div>
        <q-btn v-close-popup color="primary" :disable="paramError" label="START" :loading="taskStatus !== null" push
               size="sm"
               @click="parserPipelineStart()"/>
        <!--        <q-btn v-if="parsing" v-close-popup color="primary" label="Stop" push size="sm"-->
        <!--               @click="bootParserStop()"/>-->
        <div v-if="taskStatus !== null">
          <div class="text-subtitle5 q-mb-xs">Current task : {{ taskStatus.taskType }}</div>
          <div v-if="taskStatus.additionalInfo" class="text-subtitle5 q-mb-xs">Additional info :
            {{ taskStatus.additionalInfo }}
          </div>
        </div>
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
const kirParserSentPerSecSpeed: number = 140;

type taskType_t = "ASK_TRAINING" | "TRAINING" | "ASK_PARSING" | "PARSING"

type taskStatus_t = null | {
  taskType: taskType_t,
  taskTimeStarted: number,
  taskIntervalChecker: null | ReturnType<typeof setTimeout>,
}

type pipelineChoice_t = "TRAIN_AND_PARSE" | "TRAIN_ONLY" | "PARSE_ONLY";

type modelInfo_t = {
  project_name: string;
  model_id: string;
}

interface parser_t {
  progress: string;
  taskStatus: taskStatus_t;
  param: {
    pipelineChoice: pipelineChoice_t;
    pipelineOptions: { label: string; value: pipelineChoice_t }[];
    baseModel: modelInfo_t | null;
    baseModelsOptions: { label: string; value: modelInfo_t }[];
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

const TIMEOUT_TASK_STATUS_CHECKER = 1000 * 60 * 60 * 3 // 3 hours
const REFRESH_RATE_TASK_STATUS_CHECKER = 1000 * 10 // 10 seconds
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
        pipelineOptions: [
          {label: "Train and Parse", value: "TRAIN_AND_PARSE"},
          {label: "Train Only", value: "TRAIN_ONLY"},
          {label: "Parse Only", value: "PARSE_ONLY"},
        ],
        baseModel: null,
        baseModelsOptions: [],
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
  mounted() {
    this.fetchBaseModelsAvailables();
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
    parsingSentencesCount() {
      if (this.param.parseAll) {
        return this.samples.map((sample) => sample.sentences).reduce((partialSum, a) => partialSum + a, 0);
      }
      return this.samples
        .filter((sample) => this.param.parseSamples.includes(sample.sample_name))
        .reduce((partialSum, sample) => partialSum + sample.sentences, 0);
    },
    estimatedTime() {
      const timeInitialisationTrainingTask_s = 30;
      const trainingEstimatedTime_s = this.param.epochs * (0.5 + this.trainingSentencesCount / kirParserSentPerSecSpeed);
      const timeInitialisationParsingTask_s = 30;
      const parsingEstimatedTime_s = this.parsingSentencesCount / kirParserSentPerSecSpeed;
      const totalEstimatedTime_s = timeInitialisationTrainingTask_s + trainingEstimatedTime_s + timeInitialisationParsingTask_s + parsingEstimatedTime_s
      return Math.ceil(totalEstimatedTime_s / 60);
    },
    noTrainFileSelectedError() {
      return (this.param.pipelineChoice !== "PARSE_ONLY" && this.param.trainAll === false && this.param.trainSamples.length === 0);
    },
    noParseFileSelectedError() {
      return (this.param.pipelineChoice !== "TRAIN_ONLY" && this.param.parseAll === false && this.param.parseSamples.length === 0);
    },
    noSelectedBaseModelForParsingError() {
      return (this.param.pipelineChoice === "PARSE_ONLY" && !this.param.baseModel)
    },
    paramError() {
      if (this.noTrainFileSelectedError) {
        return true
      }
      if (this.noParseFileSelectedError) {
        return true
      }
      if (this.noSelectedBaseModelForParsingError) {
        return true
      }
      return false
    },
  },
  methods: {
    fetchBaseModelsAvailables() {
      api.parserList().then(
        (response) => {
          if (response.data.status === "failure") {
            console.log("fetchBaseModelsAvailables FAILURE")
          } else {
            this.param.baseModelsOptions = response.data.data.map((baseModel: modelInfo_t) => {
              return {
                label: `${baseModel.project_name}/${baseModel.model_id}`,
                value: baseModel
              }
            })
          }
        }
      )
    },
    parserPipelineStart() {
      if (this.param.pipelineChoice === "TRAIN_AND_PARSE" || this.param.pipelineChoice === "TRAIN_ONLY") {
        this.parserTrainStart();
      } else {
        if (this.param.baseModel) {
          this.parserParseStart(this.param.baseModel);
        }
      }
    },
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
            }, REFRESH_RATE_TASK_STATUS_CHECKER);

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
            notifyMessage({message: "Model training ended!"})
            this.clearCurrentTask()
            this.fetchBaseModelsAvailables()
            if (this.param.pipelineChoice === "TRAIN_AND_PARSE") {
              this.parserParseStart(modelInfo)
            }
          } else if (this.taskStatus && Date.now() - this.taskStatus.taskTimeStarted > TIMEOUT_TASK_STATUS_CHECKER) {
            this.clearCurrentTask()
          }
        }
      )
    },
    parserParseStart(modelInfo: modelInfo_t) {
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
            }, REFRESH_RATE_TASK_STATUS_CHECKER);

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
          } else if (this.taskStatus && Date.now() - this.taskStatus.taskTimeStarted > TIMEOUT_TASK_STATUS_CHECKER) { // 3 hours
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
