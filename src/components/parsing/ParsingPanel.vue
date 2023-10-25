<template>
  <q-card flat bordered>
    <div class="row q-pa-md q-gutter-md">
      <div class="col">
        <div class="text-h6 q-py-md">General Settings</div>
        <q-separator />
        <div class="q-py-md">
          <q-option-group :disable="disableUI" :options="param.pipelineOptions" type="radio" v-model="param.pipelineChoice" />
        </div>
        <q-separator />
        <div class="q-pa-md">
          <q-select
            outlined
            dense
            :disable="disableUI"
            v-model="param.baseModel"
            :options="param.baseModelsOptions"
            :label="`Pretrain Model`"
            hint="Optional; We will use this model as a pretrain model for your task"
            clearable
          />
        </div>
      </div>
      <q-separator vertical inset class="q-mx-lg" />
      <div v-show="param.pipelineChoice !== 'PARSE_ONLY'" class="col">
        <div class="text-h6 q-py-md">Train Settings</div>
        <q-separator />
        <div class="q-pa-sm">
          <q-toggle :disable="disableUI" v-model="param.trainAll" label="Train on all files" />
          <q-select
            dense
            outlined
            :disable="disableUI"
            :class="{ invisible: param.trainAll }"
            v-model="param.trainSamplesNames"
            :options="allSamplesNames"
            multiple
            label="Files to parse"
            stack-label
            use-chips
          />
          <q-toggle :disable="disableUI" v-model="param.isCustomTrainingUser" label="Custom Training user" />
          <q-select
            dense
            outlined
            :disable="disableUI"
            :class="{ invisible: !param.isCustomTrainingUser }"
            v-model="param.trainingUser"
            :options="trainingTreesFrom"
            label="Training user"
            stack-label
          />
        </div>
        <q-separator />
        <div class="q-pa-sm">
          <q-input
            outlined
            dense
            :disable="disableUI"
            v-model.number="param.maxEpoch"
            type="number"
            label="epochs"
            min="3"
            max="300"
            style="max-width: 100px"
            :rules="[(val) => (val >= 3 && val <= 300) || 'Please use 3 to 300 epochs']"
          />
        </div>
      </div>
      <q-separator v-show="param.pipelineChoice !== 'PARSE_ONLY'" vertical inset class="q-mx-lg" />
      <div v-show="param.pipelineChoice !== 'TRAIN_ONLY'" class="col">
        <div class="text-h6 q-py-md">Parse Settings</div>
        <q-separator />
        <div class="q-pa-md q-gutter-md">
          <q-toggle :disable="disableUI" v-model="param.parseAll" label="Parse all files" />
          <q-select
            dense
            outlined
            :disable="disableUI"
            :class="{ invisible: param.parseAll }"
            v-model="param.parseSamplesNames"
            :options="allSamplesNames"
            multiple
            label="Files to parse"
            stack-label
            use-chips
          />
          <q-input
            :disable="disableUI"
            dense
            outlined
            v-model="param.parserSuffix"
            label="Parser suffix (for parsed sentences)"
            :hint="'Parsing will go under the name `parser' + param.parserSuffix + '`'"
          />
        </div>
        <q-separator />
        <div class="q-pa-md">
          <q-toggle :disable="disableUI" v-model="param.isCustomParsingUser" label="Custom Parsing user" />
          <q-select
            :disable="disableUI"
            :class="{ invisible: !param.isCustomParsingUser }"
            v-model="param.parsingUser"
            dense
            outlined
            :options="parsingTreesFrom"
            label="Parsing user"
            stack-label
          />
          <q-toggle :disable="disableUI" v-model="param.keepHeads" label="keep existing heads" />
        </div>
      </div>
      <q-separator v-show="param.pipelineChoice !== 'TRAIN_ONLY'" vertical inset class="q-mx-lg" />
      <div class="col">
        <div class="text-h6 q-py-md">Pipeline Summary</div>
        <q-separator />
        <div class="q-pa-md">
          <div v-if="param.pipelineChoice !== `PARSE_ONLY`" class="text-subtitle5 q-mb-xs">training sentences : {{ trainingSentencesCount }}</div>
          <div v-if="param.pipelineChoice !== `TRAIN_ONLY`" class="text-subtitle5 q-mb-xs">parsing sentences : {{ parsingSentencesCount }}</div>
          <div class="text-subtitle5 q-mb-xs">estimated time = {{ estimatedTime }}mn</div>
        </div>

        <q-btn
          v-close-popup
          color="primary"
          :disable="paramError || isHealthy === false"
          label="START"
          :loading="taskStatus !== null"
          push
          @click="parserPipelineStart()"
        />
        <div v-if="taskStatus !== null">
          <div class="text-subtitle5 q-mb-xs">Current task : {{ taskStatus.taskType }}</div>
          <div v-if="taskStatus.taskAdditionalMessage" class="text-subtitle5 q-mb-xs">
            {{ taskStatus.taskAdditionalMessage }}
          </div>
        </div>
        <div v-if="isHealthy === false">
          <p class="text-subtitle5 q-mb-xs text-red-14">
            /!\ Sorry, the parsing server is unreachable, and it's not under our control. Please come back in some time.
          </p>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import api from '../../api/backend-api';
import { ModelInfo_t, ParsingSettings_t, sample_t } from 'src/api/backend-types';
import { notifyMessage } from 'src/utils/notify';
const kirParserSentPerSecSpeed: number = 140;

type taskType_t = 'ASK_TRAINING' | 'TRAINING' | 'ASK_PARSING' | 'PARSING';

type taskStatus_t = null | {
  taskType: taskType_t;
  taskAdditionalMessage?: string;
  taskTimeStarted: number;
  taskIntervalChecker: null | ReturnType<typeof setTimeout>;
};

type pipelineChoice_t = 'TRAIN_AND_PARSE' | 'TRAIN_ONLY' | 'PARSE_ONLY';

interface parser_t {
  progress: string;
  taskStatus: taskStatus_t;
  isHealthy: boolean;
  param: {
    pipelineChoice: pipelineChoice_t;
    pipelineOptions: { label: string; value: pipelineChoice_t }[];
    baseModel: ModelInfo_t | null;
    baseModelsOptions: { label: string; value: ModelInfo_t }[];
    advancedSettings: boolean;
    keepUpos: boolean;
    isCustomTrainingUser: boolean;
    trainingUser: string;
    isCustomParsingUser: boolean;
    parsingUser: string;
    trainAll: boolean;
    parseAll: boolean;
    trainSamplesNames: string[];
    parseSamplesNames: string[];
    maxEpoch: number;
    parserSuffix: string;
    keepHeads: boolean;
  };
}

const TIMEOUT_TASK_STATUS_CHECKER = 1000 * 60 * 60 * 3; // 3 hours
const REFRESH_RATE_TASK_STATUS_CHECKER = 1000 * 10; // 10 seconds
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
    },
  },

  data() {
    const data: parser_t = {
      taskStatus: null,
      progress: 'bootstrap parsing',
      isHealthy: true,
      param: {
        pipelineChoice: 'TRAIN_AND_PARSE',
        pipelineOptions: [
          { label: 'Train and Parse', value: 'TRAIN_AND_PARSE' },
          { label: 'Train Only', value: 'TRAIN_ONLY' },
          { label: 'Parse Only', value: 'PARSE_ONLY' },
        ],
        baseModel: null,
        baseModelsOptions: [],
        advancedSettings: false,
        keepUpos: false,
        isCustomTrainingUser: false,
        trainingUser: '',
        isCustomParsingUser: false,
        parsingUser: '',
        trainAll: true,
        trainSamplesNames: [],
        parseAll: true,
        parseSamplesNames: [],
        maxEpoch: 100,
        parserSuffix: '',
        keepHeads: false,
      },
    };
    return data;
  },
  mounted() {
    this.fetchBaseModelsAvailables();
  },
  computed: {
    allSamplesNames() {
      return this.samples.map((sample) => sample.sample_name).sort(this.caseUnsensitiveCompare);
    },
    trainingSamplesSelected() {
      if (this.param.trainAll) {
        return this.samples;
      } else {
        return this.samples.filter((sample) => this.param.trainSamplesNames.includes(sample.sample_name));
      }
    },
    parsingSamplesSelected() {
      if (this.param.parseAll) {
        return this.samples;
      } else {
        return this.samples.filter((sample) => this.param.parseSamplesNames.includes(sample.sample_name));
      }
    },
    allTreesFrom() {
      return this.getTreesUsersFromSamples(this.samples);
    },
    trainingTreesFrom() {
      return this.getTreesUsersFromSamples(this.trainingSamplesSelected);
    },
    parsingTreesFrom() {
      return this.getTreesUsersFromSamples(this.parsingSamplesSelected);
    },
    trainingSentencesCount() {
      if (this.param.isCustomTrainingUser === false || this.param.trainingUser === '') {
        return this.trainingSamplesSelected.reduce((partialSum, sample) => partialSum + sample.sentences, 0);
      } else {
        return this.trainingSamplesSelected.reduce((partialSum, sample) => partialSum + sample.treeByUser[this.param.trainingUser], 0);
      }
    },
    parsingSentencesCount() {
      if (this.param.isCustomParsingUser === false || this.param.parsingUser === '') {
        return this.parsingSamplesSelected.reduce((partialSum, sample) => partialSum + sample.sentences, 0);
      } else {
        return this.parsingSamplesSelected.reduce((partialSum, sample) => partialSum + sample.treeByUser[this.param.parsingUser], 0);
      }
    },
    estimatedTime() {
      const timeInitialisationTrainingTask_s = 60;
      const trainingEstimatedTime_s = this.param.maxEpoch * (0.5 + this.trainingSentencesCount / kirParserSentPerSecSpeed);
      const timeInitialisationParsingTask_s = 60;
      const parsingEstimatedTime_s = this.parsingSentencesCount / kirParserSentPerSecSpeed;
      let totalEstimatedTime_s = 0;
      if (this.param.pipelineChoice !== 'PARSE_ONLY') {
        totalEstimatedTime_s += timeInitialisationTrainingTask_s + trainingEstimatedTime_s;
      }
      if (this.param.pipelineChoice !== 'TRAIN_ONLY') {
        totalEstimatedTime_s += timeInitialisationParsingTask_s + parsingEstimatedTime_s;
      }
      return Math.ceil(totalEstimatedTime_s / 60);
    },
    noTrainFileSelectedError() {
      return this.param.pipelineChoice !== 'PARSE_ONLY' && this.param.trainAll === false && this.param.trainSamplesNames.length === 0;
    },
    noParseFileSelectedError() {
      return this.param.pipelineChoice !== 'TRAIN_ONLY' && this.param.parseAll === false && this.param.parseSamplesNames.length === 0;
    },
    noSelectedBaseModelForParsingError() {
      return this.param.pipelineChoice === 'PARSE_ONLY' && !this.param.baseModel;
    },
    paramError() {
      if (this.noTrainFileSelectedError) {
        return true;
      }
      if (this.noParseFileSelectedError) {
        return true;
      }
      if (this.noSelectedBaseModelForParsingError) {
        return true;
      }
      return false;
    },
    disableUI() {
      return !!this.taskStatus || this.isHealthy === false;
    },
  },
  methods: {
    getTreesUsersFromSamples(samples: sample_t[]) {
      const allTreesFromWithDuplicate = samples.map((sample) => sample.treesFrom).reduce((a: string[], b: string[]) => [...a, ...b], []);
      return [...new Set(allTreesFromWithDuplicate)];
    },
    fetchBaseModelsAvailables() {
      api.parserList().then((response) => {
        if (response.data.status === 'failure') {
          notifyMessage({ message: 'Sorry, the parsing server is unreachable and not under our control, please come back later', type: 'negative' });
          this.isHealthy = false;
        } else {
          const options = response.data.data.map((baseModelMeta) => {
            return {
              label: `${baseModelMeta.model_info.project_name} - ${baseModelMeta.model_info.model_id} (${
                baseModelMeta.scores_best.training_diagnostics.epoch
              } epochs ; ${baseModelMeta.scores_best.LAS_epoch.toFixed(4)} LAS ; ${
                baseModelMeta.scores_best.training_diagnostics.data_description.n_train_sents +
                baseModelMeta.scores_best.training_diagnostics.data_description.n_test_sents
              } sents)`,
              value: baseModelMeta.model_info,
            };
          });
          options.sort((a, b) => this.caseUnsensitiveCompare(a.label, b.label)); // sort by label (case-insensitive)
          this.param.baseModelsOptions = options;
        }
      });
    },
    caseUnsensitiveCompare(a: string, b: string) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    },
    parserPipelineStart() {
      if (this.param.pipelineChoice === 'TRAIN_AND_PARSE' || this.param.pipelineChoice === 'TRAIN_ONLY') {
        this.parserTrainStart();
      } else {
        if (this.param.baseModel) {
          this.parserParseStart((this.param.baseModel as any).value as ModelInfo_t);
        }
      }
    },
    parserTrainStart() {
      this.taskStatus = {
        taskType: 'ASK_TRAINING',
        taskTimeStarted: Date.now(),
        taskIntervalChecker: null,
      };

      const trainSampleNames = this.param.trainAll ? this.allSamplesNames : this.param.trainSamplesNames;
      const trainUser = this.param.isCustomTrainingUser ? this.param.trainingUser : 'last';
      const maxEpoch = this.param.maxEpoch;
      const baseModel = this.param.baseModel ? ((this.param.baseModel as any).value as ModelInfo_t) : null;
      api
        .parserTrainStart(this.$route.params.projectname as any as string, trainSampleNames, trainUser, maxEpoch, baseModel)
        .then((response) => {
          if (response.data.status === 'failure') {
            notifyMessage({ message: 'Training could not start : ' + response.data.error, type: 'negative' });
            this.clearCurrentTask();
          } else {
            notifyMessage({ message: 'Model training started' });
            const modelInfo = response.data.data.model_info;
            const trainTaskId = response.data.data.train_task_id;
            const taskIntervalChecker = setInterval(() => {
              setTimeout(this.parserTrainStatus(modelInfo, trainTaskId) as any, 10);
            }, REFRESH_RATE_TASK_STATUS_CHECKER);

            this.taskStatus = {
              taskType: 'TRAINING',
              taskTimeStarted: Date.now(),
              taskIntervalChecker,
              taskAdditionalMessage: `model initialisation and data preparation`,
            };
          }
        })
        .catch((error) => {
          console.log(error);
          this.clearCurrentTask();
        });
    },
    parserTrainStatus(modelInfo: ModelInfo_t, trainTaskId: string) {
      api
        .parserTrainStatus(modelInfo, trainTaskId)
        .then((response) => {
          if (response.data.status === 'failure') {
            this.clearCurrentTask();
          } else if (response.data.data.ready) {
            const scores_best = response.data.data.scores_best;
            notifyMessage({
              message: `Model ${modelInfo.model_id}: training ended ; LAS=${scores_best.LAS_chuliu_epoch} ; best_epoch=${scores_best.training_diagnostics.epoch}`,
            });
            this.clearCurrentTask();
            this.fetchBaseModelsAvailables();
            if (this.param.pipelineChoice === 'TRAIN_AND_PARSE') {
              this.parserParseStart(modelInfo);
            }
          } else if (this.taskStatus && Date.now() - this.taskStatus.taskTimeStarted > TIMEOUT_TASK_STATUS_CHECKER) {
            this.clearCurrentTask();
          } else if (!response.data.data.ready) {
            if (this.taskStatus) {
              if (response.data.data.scores_history) {
                const last_epoch = response.data.data.scores_history[response.data.data.scores_history.length - 1];
                const best_epoch = response.data.data.scores_best;
                if (best_epoch) {
                  this.taskStatus.taskAdditionalMessage = `epoch ${last_epoch.training_diagnostics.epoch} ; LAS=${last_epoch.LAS_chuliu_epoch} (best: epoch ${best_epoch.training_diagnostics.epoch} ; LAS=${best_epoch.LAS_chuliu_epoch})`;
                }
              }
            }
          }
        })
        .catch((error) => {
          console.log(error);
          this.clearCurrentTask();
        });
    },
    parserParseStart(modelInfo: ModelInfo_t) {
      this.taskStatus = {
        taskType: 'ASK_PARSING',
        taskTimeStarted: Date.now(),
        taskIntervalChecker: null,
      };

      const projectName = this.$route.params.projectname as any as string;
      const toParseSamplesNames = this.param.parseAll ? this.allSamplesNames : this.param.parseSamplesNames;
      const parserSuffix = this.param.parserSuffix;
      const parsingUser = this.param.isCustomParsingUser ? this.param.parsingUser : 'last';
      const parsingSettings: ParsingSettings_t = {
        keep_heads: this.param.keepHeads ? 'EXISTING' : 'NONE',
      };
      api
        .parserParseStart(projectName, modelInfo, toParseSamplesNames, parsingUser, parsingSettings)
        .then((response) => {
          if (response.data.status === 'failure') {
            notifyMessage({ message: 'Parsing could not start : ' + response.data.error, type: 'negative' });
            this.clearCurrentTask();
          } else {
            notifyMessage({ message: 'Sentences parsing started' });
            const parseTaskId = response.data.data.parse_task_id;
            const taskIntervalChecker = setInterval(() => {
              setTimeout(this.parserParseStatus(projectName, modelInfo, parseTaskId, parserSuffix) as any, 10);
            }, REFRESH_RATE_TASK_STATUS_CHECKER);

            this.taskStatus = {
              taskType: 'PARSING',
              taskTimeStarted: Date.now(),
              taskIntervalChecker,
            };
          }
        })
        .catch((error) => {
          console.log(error);
          this.clearCurrentTask();
        });
    },
    parserParseStatus(projectName: string, modelInfo: ModelInfo_t, parseTaskId: string, parserSuffix: string) {
      api
        .parserParseStatus(projectName, modelInfo, parseTaskId, parserSuffix)
        .then((response) => {
          if (response.data.status === 'failure') {
            this.clearCurrentTask();
          } else if (response.data.data.ready) {
            this.clearCurrentTask();
            this.parentGetProjectSamples();
            notifyMessage({ message: 'Sentences parsing ended!' });
          } else if (this.taskStatus && Date.now() - this.taskStatus.taskTimeStarted > TIMEOUT_TASK_STATUS_CHECKER) {
            // 3 hours
            this.clearCurrentTask();
          }
        })
        .catch((error) => {
          console.log(error);
          this.clearCurrentTask();
        });
    },
    clearCurrentTask() {
      if (this.taskStatus) {
        if (this.taskStatus.taskIntervalChecker) {
          clearInterval(this.taskStatus.taskIntervalChecker);
        }
        this.taskStatus = null;
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
