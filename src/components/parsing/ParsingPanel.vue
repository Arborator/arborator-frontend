<template>
  <q-card bordered flat>
    <!-- pretrained Models -->
    <q-card-section v-if="isShowModels">
      <div class="row">
        <div class="col q-gutter-md">
          <q-btn
            :disable="disableUI || !parserData.param.canRemoveParser"
            outline
            color="primary"
            no-caps
            :label="$t('parser.removeModel')"
            icon="delete"
            @click="triggerConfirm(removeModel)"
          >
            <q-tooltip v-if="!modelsTable.selected.length">
              {{ $t('parser.disableRemoveBtnTooltip[0]') }}
            </q-tooltip>
            <q-tooltip v-if="!parserData.param.canRemoveParser">
              {{ $t('parser.disableRemoveBtnTooltip[1]') }}
            </q-tooltip>
          </q-btn>
          <q-btn :disable="disableUI" no-caps outline color="primary" :label="$t('parser.trainBtn')" icon="add" @click="onclickTrain()" />
          <q-btn
            :disable="disableUI || !modelsTable.selected.length"
            no-caps
            outline
            color="primary"
            :label="$t('parser.parseBtn')"
            icon="edit_note"
            @click="
              parserData.param.pipelineChoice = 'PARSE_ONLY';
              isShowModels = false;
            "
          >
            <q-tooltip v-if="!modelsTable.selected.length">
              {{ $t('parser.disableRemoveBtnTooltip[0]') }}
            </q-tooltip>
          </q-btn>
        </div>
        <div class="col">
          <q-input outlined dense v-model="modelsTable.filter" icon="search" :label="$t('parser.searchLabel')">
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
      <q-table
        flat
        :columns="modelsTable.fields"
        :rows="parserData.param.availableModels"
        :filter="modelsTable.filter"
        :filter-method="filterModels"
        hide-no-data
        row-key="modelId"
        selection="single"
        v-model:selected="modelsTable.selected"
      >
      </q-table>
    </q-card-section>
    <q-card-section v-if="!isShowModels" class="q-gutter-md">
      <div>
        <q-btn flat icon="arrow_back" @click="isShowModels = true; parserData.param.pipelineChoice = ''" />
      </div>
      <div v-if="modelsTable.selected.length" class="row q-gutter-md">
        <div class="text-h6">
          {{ $t('parser.baseModel') }} : {{ modelsTable.selected[0].projectName+'_' + modelsTable.selected[0].modelId }}
        </div>
      </div>
      <div v-else class="row q-gutter-md">
        <div>
          {{ $t('parser.noBaseModelSelected') }}
        </div>
      </div>
      <!-- training panel -->
      <div v-if="parserData.param.pipelineChoice === 'TRAIN_AND_PARSE' || parserData.param.pipelineChoice === 'TRAIN_ONLY'" class="q-gutter-md">
        <div class="row text-h6">
          {{ $t('parser.trainSettings') }}
        </div>
        <div class="row">
          <div class="col">
            <q-toggle v-model="parserData.param.trainAll" :label="$t('parser.trainOnAllfiles')"></q-toggle>
          </div>
          <div v-if="!parserData.param.trainAll" class="col-4 q-pr-md">
            <q-select
              dense
              outlined
              v-model="parserData.param.trainSamplesNames"
              :options="allSamplesNames"
              :label="$t('parser.filesToTrain')"
              use-chips
              multiple
              stack-label
            />
          </div>
          <div class="col">
            <q-toggle v-model="parserData.param.isCustomTrainingUser" :label="$t('parser.customUser')" />
          </div>
          <div v-if="parserData.param.isCustomTrainingUser" class="col-4">
            <q-select
              dense
              outlined
              v-model="parserData.param.trainingUser"
              :options="trainingTreesFrom"
              :label="$t('parser.trainingUser')"
              stack-label
            />
          </div>
        </div>
        <div class="row">
          <div class="col q-pr-md">
            <q-input
              outlined
              dense
              v-model.number="parserData.param.maxEpoch"
              type="number"
              label="epochs"
              min="3"
              max="300"
              :rules="[(val) => (val >= 3 && val <= 300) || 'Please use 3 to 300 epochs']"
            />
          </div>
          <div class="col">
            <q-btn-toggle
              v-model="parserData.param.pipelineChoice"
              no-caps
              toggle-color="primary"
              :options="[
                { label: $t('parser.parserChoices[0]'), value: 'TRAIN_AND_PARSE' },
                { label: $t('parser.parserChoices[1]'), value: 'TRAIN_ONLY' },
              ]"
            />
          </div>
        </div>
      </div>
      <!-- parsing panel -->
      <div v-if="parserData.param.pipelineChoice === 'TRAIN_AND_PARSE' || parserData.param.pipelineChoice === 'PARSE_ONLY'" class="q-gutter-md">
        <div class="row text-h6">
          {{ $t('parser.parseSettings') }}
        </div>
        <div class="row">
          <div class="col">
            <q-toggle v-model="parserData.param.parseAll" :label="$t('parser.parseAllFiles')" />
          </div>
          <div v-if="!parserData.param.parseAll" class="col-4 q-pr-md">
            <q-select
              dense
              outlined
              v-model="parserData.param.parseSamplesNames"
              :options="allSamplesNames"
              :label="$t('parser.filesToParse')"
              use-chips
              multiple
              stack-label
            />
          </div>
          <div class="col">
            <q-toggle v-model="parserData.param.isCustomParsingUser" :label="$t('parser.customParserUser')" />
          </div>
          <div v-if="parserData.param.isCustomParsingUser" class="col-4">
            <q-select v-model="parserData.param.parsingUser" dense outlined :options="parsingTreesFrom" :label="$t('parser.parseUser')" stack-label />
          </div>
        </div>
        <div class="row">
          <div class="col q-pr-md">
            <q-input
              dense
              outlined
              v-model="parserData.param.parserSuffix"
              :label="$t('parser.parseSuffix')"
              :hint="$t('parser.parseHint') + parserData.param.parserSuffix + '`'"
              stack-label
            />
          </div>
          <div class="col">
            <q-select
              dense
              outlined
              v-model="parserData.param.columnsToKeep"
              :options="conllColumns"
              multiple
              use-chips
              :label="$t('parser.columnsToKeep')"
            />
          </div>
        </div>
      </div>
      <div v-if="!isShowModels" class="q-gutter-md">
        <q-separator />
        <div class="row text-h6">
          {{ $t('parser.pipelineSummary') }}
        </div>
        <div>
          <q-item bordered separator>
            <q-item-section v-if="parserData.param.pipelineChoice === 'TRAIN_AND_PARSE' || parserData.param.pipelineChoice === 'TRAIN_ONLY'">
              <q-item-label class="text-weight-bold text-grey">{{ $t('parser.trainingSents') }}</q-item-label>
              <q-item-label lines="2">{{ trainingSentencesCount }}</q-item-label>
            </q-item-section>
            <q-item-section v-if="parserData.param.pipelineChoice === 'TRAIN_AND_PARSE' || parserData.param.pipelineChoice === 'PARSE_ONLY'">
              <q-item-label class="text-weight-bold text-grey">{{ $t('parser.parseSents') }} </q-item-label>
              <q-item-label lines="2">{{ parsingSentencesCount }}</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-grey">{{ $t('parser.timeEstimated') }}</q-item-label>
              <q-item-label lines="2">{{ estimatedTime }} mn</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <div v-if="parserData.taskStatus !== null">
            <div class="text-subtitle5 q-mb-xs">{{ $t('parser.currentTask') }}: {{ parserData.taskStatus.taskType }}</div>
            <div v-if="parserData.taskStatus.taskAdditionalMessage" class="text-subtitle5 q-mb-xs">
              {{ parserData.taskStatus.taskAdditionalMessage }}
            </div>
          </div>
          <div v-if="parserData.isHealthy === false">
            <p class="text-subtitle5 q-mb-xs text-red-14">
              /!\ Sorry, the parsing server is unreachable, and it's not under our control. Please come back in some time.
            </p>
          </div>
        </div>
        <div class="row" style="justify-content: right">
          <q-btn
            :disable="paramError || parserData.isHealthy === false"
            color="primary"
            :label="$t('parser.startBtn')"
            :loading="parserData.taskStatus !== null"
            push
            @click="parserPipelineStart()"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
  <q-dialog v-model="confirmActionDial">
    <ConfirmAction :parent-action="confirmActionCallback" :target-name="modelsTable.selected[0].projectName" />
  </q-dialog>
</template>
<script lang="ts">
import { mapState } from 'pinia';
import api from 'src/api/backend-api';
import { ModelInfo_t, ParsingSettings_t, sample_t } from 'src/api/backend-types';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { table_t } from 'src/types/main_types';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { PropType, defineComponent } from 'vue';

import ConfirmAction from '../shared/ConfirmAction.vue';

const kirParserSentPerSecSpeed: number = 140;
const TIMEOUT_TASK_STATUS_CHECKER = 1000 * 60 * 60 * 3; // 3 hours
const REFRESH_RATE_TASK_STATUS_CHECKER = 1000 * 10; // 10 seconds

type pipelineChoice_t = '' | 'TRAIN_AND_PARSE' | 'TRAIN_ONLY' | 'PARSE_ONLY';

type taskType_t = 'ASK_TRAINING' | 'TRAINING' | 'ASK_PARSING' | 'PARSING';

type taskStatus_t = null | {
  taskType: taskType_t;
  taskAdditionalMessage?: string;
  taskTimeStarted: number;
  taskIntervalChecker: null | ReturnType<typeof setTimeout>;
};

type tableItem_t = {
  projectName: string,
  modelId: string,
  language: string,
  sentencesNumber: number
  epoch: number,
  bestLAS: number,
  admins: string[],
}
interface parser_t {
  progress: string;
  taskStatus: taskStatus_t;
  isHealthy: boolean;
  param: {
    pipelineChoice: pipelineChoice_t;
    availableModels: any[];
    baseModel: ModelInfo_t | null;
    columnsToKeep: string[];
    isCustomTrainingUser: boolean;
    isCustomParsingUser: boolean;
    trainingUser: string;
    parsingUser: string;
    trainAll: boolean;
    parseAll: boolean;
    trainSamplesNames: string[];
    parseSamplesNames: string[];
    maxEpoch: number;
    parserSuffix: string;
    canRemoveParser: boolean;
  };
}
export default defineComponent({
  name: 'Parsing',
  components: {
    ConfirmAction,
  },
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
    const modelsTable: table_t<tableItem_t> = {
      fields: [
        {
          name: 'projectName',
          label: this.$t('parser.modelsTableColumns[0]'),
          sortable: true,
          field: 'projectName',
        },
        {
          name: 'language',
          label: this.$t('parser.modelsTableColumns[1]'),
          sortable: true,
          field: 'language',
        },
        {
          name: 'sentencesNumber',
          label: this.$t('parser.modelsTableColumns[2]'),
          sortable: true,
          field: 'sentencesNumber',
        },
        {
          name: 'trainingDate',
          label: this.$t('parser.modelsTableColumns[3]'),
          sortable: true,
          field: 'modelId',
        },
        {
          name: 'bestLAS',
          label: this.$t('parser.modelsTableColumns[4]'),
          sortable: true,
          field: 'bestLAS',
        },
        {
          name: 'epoch',
          label: this.$t('parser.modelsTableColumns[5]'),
          sortable: true,
          field: 'epoch',
        },
      ],
      visibleColumns: [],
      filter: '',
      selected: [],
      loading: false,
      pagination: {
        sortBy: 'projectName',
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
      loadingDelete: false,
      exporting: false,
    };
    const parserData: parser_t = {
      progress: 'bootstrap parsing',
      taskStatus: null,
      isHealthy: true,
      param: {
        pipelineChoice: '',
        availableModels: [],
        baseModel: null,
        columnsToKeep: [],
        isCustomTrainingUser: false,
        isCustomParsingUser: false,
        trainingUser: '',
        parsingUser: '',
        trainAll: true,
        trainSamplesNames: [],
        parseAll: true,
        parseSamplesNames: [],
        maxEpoch: 100,
        parserSuffix: '',
        canRemoveParser: false,
      },
    };
    const conllColumns = ['LEMMA', 'UPOS', 'XPOS', 'FEATS', 'HEAD', 'DEPREL'];
    const confirmActionCallback = null as unknown as CallableFunction;
    return {
      modelsTable,
      conllColumns,
      search: '',
      isShowModels: true,
      parserData,
      modelOptions: [],
      confirmActionCallback,
      confirmActionDial: false,
    };
  },
  computed: {
    ...mapState(useProjectStore, ['name']),
    ...mapState(useUserStore, ['isSuperAdmin', 'username']),
    allSamplesNames() {
      return this.samples.map((sample) => sample.sampleName).sort(this.caseUnsensitiveCompare);
    },
    trainingSamplesSelected() {
      if (this.parserData.param.trainAll) {
        return this.samples;
      } else {
        return this.samples.filter((sample) => this.parserData.param.trainSamplesNames.includes(sample.sampleName));
      }
    },
    parsingSamplesSelected() {
      if (this.parserData.param.parseAll) {
        return this.samples;
      } else {
        return this.samples.filter((sample) => this.parserData.param.parseSamplesNames.includes(sample.sampleName));
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
      if (this.parserData.param.isCustomTrainingUser === false || this.parserData.param.trainingUser === '') {
        return this.trainingSamplesSelected.reduce((partialSum, sample) => partialSum + sample.sentences, 0);
      } else {
        return this.trainingSamplesSelected.reduce((partialSum, sample) => partialSum + sample.treeByUser[this.parserData.param.trainingUser], 0);
      }
    },
    parsingSentencesCount() {
      if (this.parserData.param.isCustomParsingUser === false || this.parserData.param.parsingUser === '') {
        return this.parsingSamplesSelected.reduce((partialSum, sample) => partialSum + sample.sentences, 0);
      } else {
        return this.parsingSamplesSelected.reduce((partialSum, sample) => partialSum + sample.treeByUser[this.parserData.param.parsingUser], 0);
      }
    },
    estimatedTime() {
      const timeInitialisationTrainingTask_s = 60;
      const trainingEstimatedTime_s = this.parserData.param.maxEpoch * (0.5 + this.trainingSentencesCount / kirParserSentPerSecSpeed);
      const timeInitialisationParsingTask_s = 60;
      const parsingEstimatedTime_s = this.parsingSentencesCount / kirParserSentPerSecSpeed;
      let totalEstimatedTime_s = 0;
      if (this.parserData.param.pipelineChoice !== 'PARSE_ONLY') {
        totalEstimatedTime_s += timeInitialisationTrainingTask_s + trainingEstimatedTime_s;
      }
      if (this.parserData.param.pipelineChoice !== 'TRAIN_ONLY') {
        totalEstimatedTime_s += timeInitialisationParsingTask_s + parsingEstimatedTime_s;
      }
      return Math.ceil(totalEstimatedTime_s / 60);
    },
    noTrainFileSelectedError() {
      return (
        this.parserData.param.pipelineChoice !== 'PARSE_ONLY' &&
        this.parserData.param.trainAll === false &&
        this.parserData.param.trainSamplesNames.length === 0
      );
    },
    noParseFileSelectedError() {
      return (
        this.parserData.param.pipelineChoice !== 'TRAIN_ONLY' &&
        this.parserData.param.parseAll === false &&
        this.parserData.param.parseSamplesNames.length === 0
      );
    },
    paramError() {
      if (this.noTrainFileSelectedError) {
        return true;
      }
      if (this.noParseFileSelectedError) {
        return true;
      }
      return false;
    },
    disableUI() {
      return !!this.parserData.taskStatus || this.parserData.isHealthy === false;
    },
  },
  watch: {
    'modelsTable.selected': {
      handler: function (selected) {
        if (selected.length) {
          if (selected[0].admins.includes(this.username) || this.isSuperAdmin) {
            this.parserData.param.canRemoveParser = true;
          } else {
            this.parserData.param.canRemoveParser = false;
          }
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.fetchBaseModelsAvailables();
  },
  methods: {
    getTreesUsersFromSamples(samples: sample_t[]) {
      const allTreesFromWithDuplicate = samples.map((sample) => sample.treesFrom).reduce((a: string[], b: string[]) => [...a, ...b], []);
      return [...new Set(allTreesFromWithDuplicate)];
    },
    caseUnsensitiveCompare(a: string, b: string) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    },
    onclickTrain() {
      this.parserData.param.pipelineChoice = 'TRAIN_AND_PARSE';
      this.isShowModels = false;
      if (this.parserData.param.availableModels.map((model) => model.projectName).some((project) => project === this.name)) {
        notifyMessage({
          message:
            'There is already model trained with the samples of this project, if you want to train new model please remove unused models of this projects',
          position: 'top',
          color: 'warning',
          timeout: 0,
        });
      }
    },
    filterModels(rows: any, terms: any) {
      return rows.filter((row: any) => {
        const filterProjectName = row.projectName.toLowerCase().indexOf(terms.toLowerCase()) !== -1;
        const filterLanguage = row.language ? row.language.toLowerCase().indexOf(terms.toLowerCase()) !== -1 : false;
        return filterProjectName || filterLanguage;
      });
    },
    triggerConfirm(method: CallableFunction) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
    },
    removeModel() {
      const modelId = this.modelsTable.selected[0].modelId;
      const projectName = this.modelsTable.selected[0].projectName;
      api
        .parserRemove(projectName, modelId)
        .then(() => {
          notifyMessage({ message: `Model ${projectName}_${modelId} has been deleted successfully` });
          this.fetchBaseModelsAvailables();
        })
        .catch((error) => {
          notifyError({ error: error.response.data.message });
        });
    },
    fetchBaseModelsAvailables() {
      api
        .parserList()
        .then((response) => {
          if (response.data.status === 'success') {
            this.parserData.param.availableModels = response.data.data.map((pretrainedModel) => {
              return {
                projectName: pretrainedModel.model_info.project_name,
                modelId: pretrainedModel.model_info.model_id,
                language: pretrainedModel.language,
                admins: pretrainedModel.admins,
                sentencesNumber:
                  pretrainedModel.scores_best.training_diagnostics.data_description.n_train_sents +
                  pretrainedModel.scores_best.training_diagnostics.data_description.n_test_sents,
                epoch: pretrainedModel.scores_best.training_diagnostics.epoch,
                bestLAS: pretrainedModel.scores_best.LAS_epoch.toFixed(4),
              };
            });
          }
        })
        .catch((error) => {
          notifyError({ error: error.response.data.message });
        });
    },
    parserPipelineStart() {
      if (this.parserData.param.pipelineChoice === 'TRAIN_AND_PARSE' || this.parserData.param.pipelineChoice === 'TRAIN_ONLY') {
        this.parserTrainStart();
      } else if (this.modelsTable.selected.length) {
        this.parserData.param.baseModel = {
          project_name: this.modelsTable.selected[0].projectName,
          model_id: this.modelsTable.selected[0].modelId,
        };
        this.parserParseStart(this.parserData.param.baseModel as any as ModelInfo_t);
      }
    },
    parserTrainStart() {
      this.parserData.taskStatus = {
        taskType: 'ASK_TRAINING',
        taskTimeStarted: Date.now(),
        taskIntervalChecker: null,
      };
      if (this.modelsTable.selected.length) {
        this.parserData.param.baseModel = { 
          project_name: this.modelsTable.selected[0].projectName,
          model_id: this.modelsTable.selected[0].modelId,
        };
      }
      const trainSampleNames = this.parserData.param.trainAll ? this.allSamplesNames : this.parserData.param.trainSamplesNames;
      const trainUser = this.parserData.param.isCustomTrainingUser ? this.parserData.param.trainingUser : 'last';
      const maxEpoch = this.parserData.param.maxEpoch;
      const baseModel = this.parserData.param.baseModel ? ((this.parserData.param.baseModel as any) as ModelInfo_t) : null;
      api
        .parserTrainStart(this.$route.params.projectname as any as string, trainSampleNames, trainUser, maxEpoch, baseModel)
        .then((response) => {
          if (response.data.status === 'failure') {
            notifyError({ error: 'Training could not start : ' + response.data.error });
            this.clearCurrentTask();
          } else {
            notifyMessage({ message: 'Model training started' });
            const modelInfo = response.data.data.model_info;
            const trainTaskId = response.data.data.train_task_id;
            const taskIntervalChecker = setInterval(() => {
              setTimeout(this.parserTrainStatus(modelInfo, trainTaskId) as any, 10);
            }, REFRESH_RATE_TASK_STATUS_CHECKER);

            this.parserData.taskStatus = {
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
            notifyError({ error: response.data.error });
            this.clearCurrentTask();
          } else if (response.data.data.ready) {
            const scores_best = response.data.data.scores_best;
            notifyMessage({
              message: `Model ${modelInfo.model_id}: training ended ; LAS=${scores_best.LAS_chuliu_epoch} ; best_epoch=${scores_best.training_diagnostics.epoch}`,
              timeout: 0,
            });
            this.clearCurrentTask();
            this.fetchBaseModelsAvailables();
            if (this.parserData.param.pipelineChoice === 'TRAIN_AND_PARSE') {
              this.parserParseStart(modelInfo);
            }
          } else if (this.parserData.taskStatus && Date.now() - this.parserData.taskStatus.taskTimeStarted > TIMEOUT_TASK_STATUS_CHECKER) {
            this.clearCurrentTask();
          } else if (!response.data.data.ready) {
            if (this.parserData.taskStatus) {
              if (response.data.data.scores_history) {
                const last_epoch = response.data.data.scores_history[response.data.data.scores_history.length - 1];
                const best_epoch = response.data.data.scores_best;
                if (best_epoch) {
                  this.parserData.taskStatus.taskAdditionalMessage = `epoch ${
                    last_epoch.training_diagnostics.epoch
                  } ; LAS=${last_epoch.LAS_chuliu_epoch.toFixed(4)} (best: epoch ${
                    best_epoch.training_diagnostics.epoch
                  } ; LAS=${best_epoch.LAS_chuliu_epoch.toFixed(4)})`;
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
      this.parserData.taskStatus = {
        taskType: 'ASK_PARSING',
        taskTimeStarted: Date.now(),
        taskIntervalChecker: null,
      };

      const projectName = this.$route.params.projectname as any as string;
      const toParseSamplesNames = this.parserData.param.parseAll ? this.allSamplesNames : this.parserData.param.parseSamplesNames;
      const parserSuffix = this.parserData.param.parserSuffix;
      const parsingUser = this.parserData.param.isCustomParsingUser ? this.parserData.param.parsingUser : 'last';
      const parsingSettings: ParsingSettings_t = {
        keep_heads: this.parserData.param.columnsToKeep.includes('HEAD') ? 'EXISTING' : 'NONE',
        keep_upos: this.parserData.param.columnsToKeep.includes('UPOS') ? 'EXISTING' : 'NONE',
        keep_feats: this.parserData.param.columnsToKeep.includes('FEATS') ? 'EXISTING' : 'NONE',
        keep_xpos: this.parserData.param.columnsToKeep.includes('XPOS') ? 'EXISTING' : 'NONE',
        keep_deprels: this.parserData.param.columnsToKeep.includes('DEPREL') ? 'EXISTING' : 'NONE',
        keep_lemmas: this.parserData.param.columnsToKeep.includes('LEMMA') ? 'EXISTING' : 'NONE',
      };
      api
        .parserParseStart(projectName, modelInfo, toParseSamplesNames, parsingUser, parsingSettings)
        .then((response) => {
          if (response.data.status === 'failure') {
            notifyError({ error: 'Parsing could not start : ' + response.data.error });
            this.clearCurrentTask();
          } else {
            notifyMessage({ message: 'Sentences parsing started' });
            const parseTaskId = response.data.data.parse_task_id;
            const taskIntervalChecker = setInterval(() => {
              setTimeout(this.parserParseStatus(projectName, modelInfo, parseTaskId, parserSuffix) as any, 10);
            }, REFRESH_RATE_TASK_STATUS_CHECKER);

            this.parserData.taskStatus = {
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
            notifyMessage({ message: 'Sentences parsing ended!', timeout: 0, });
          } else if (this.parserData.taskStatus && Date.now() - this.parserData.taskStatus.taskTimeStarted > TIMEOUT_TASK_STATUS_CHECKER) {
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
      if (this.parserData.taskStatus) {
        if (this.parserData.taskStatus.taskIntervalChecker) {
          clearInterval(this.parserData.taskStatus.taskIntervalChecker);
        }
        this.parserData.taskStatus = null;
      }
    },
  },
});
</script>
