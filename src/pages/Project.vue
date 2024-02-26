<template>
  <q-page id="container">
    <q-card flat style="max-width: 100%">
      <q-card-section class="project-header">
        <q-img class="project-image" :src="imageSrc" basic>
          <div class="absolute-bottom text-h6" style="padding: 6px">
            <ProjectIcon :visibility="visibility" :blindAnnotationMode="blindAnnotationMode" />
            {{ $t('projectView.project') }} {{ projectName }}
            <q-btn v-if="isAdmin" flat round icon="settings" @click="projectSettingsDial = true">
              <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipSettings') }}</q-tooltip>
            </q-btn>
            <q-btn v-else flat round :color="$q.dark.isActive ? 'primary' : ''" icon="settings" @click="simpleProjectInfoDialog = true">
              <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipViewAdmin') }}</q-tooltip>
            </q-btn>
          </div>
        </q-img>
        <div class="text-primary">{{ description }}</div>
      </q-card-section>

      <q-card-section class="shadow-4" v-if="isShowLexiconPanel">
        <q-bar class="bg-primary text-white">
          <q-space />
          <q-btn @click="isShowLexiconPanel = false" dense flat icon="close"> </q-btn>
        </q-bar>
        <LexiconMain :sample-ids="selectedSamplesNames"></LexiconMain>
      </q-card-section>

      <!-- Parsing Panel -->
      <q-card-section v-if="isShowParsingPanel">
        <q-bar class="bg-primary text-white">
          <q-space />
          <q-btn @click="isShowParsingPanel = false" dense flat icon="close"> </q-btn>
        </q-bar>
        <ParsingPanel :samples="samples" :parentGetProjectSamples="getProjectSamples"></ParsingPanel>
      </q-card-section>

      <q-card-section>
        <q-table
          flat
          bordered
          :key="tableKey"
          v-model:pagination="table.pagination"
          v-model:selected="table.selected"
          :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
          :rows="samples"
          :columns="table.fields"
          row-key="sample_name"
          :loading="table.loading"
          loading-label="loading"
          :filter="table.filter"
          :filter-method="searchSamples"
          binary-state-sort
          :visible-columns="blindAnnotationMode ? table.visibleColumnsBlindAnnotationMode : table.visibleColumns"
          selection="multiple"
          :table-header-class="$q.dark.isActive ? 'text-white' : 'text-primary'"
          virtual-scroll
          table-style="max-height:80vh"
          hide-no-data
          :rows-per-page-options="[30]"
        >
          <template #bottom class="q-gutter-md">
            <div class="q-pa-md">Records per page</div>
            <q-select dense borderless v-model="table.pagination.rowsPerPage" :options="recordsPerPage" />
            <q-pagination v-model="table.pagination.page" :max="Math.ceil(samplesNumber / table.pagination.rowsPerPage)" :input="true" />
          </template>
          <template #top="props">
            <!-- begining of Options bar -->
            <q-btn-group flat>
              <!-- single and main button for upload -->
              <q-btn v-if="isAdmin" :disable="isFreezed" flat color="default" icon="cloud_upload" @click="uploadDial = true">
                <q-tooltip v-if="isAdmin" :delay="300" content-class="text-white bg-primary">
                  {{ $t('projectView.tooltipAddSample') }}
                </q-tooltip>
              </q-btn>

              <!-- single and main button for export -->
              <div v-if="canExportTrees">
                <q-btn
                  flat
                  color="default"
                  icon="cloud_download"
                  :loading="table.exporting"
                  :disable="table.selected.length < 1"
                  @click="isShowExportDialo = true"
                />
                <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">
                  {{ $t('projectView.tooltipExportSample[0]') }}
                </q-tooltip>
                <q-tooltip v-else :delay="300" content-class="text-white bg-primary">
                  {{ $t('projectView.tooltipExportSample[1]') }}
                </q-tooltip>
              </div>

              <!-- single and main button for export evaluation -->
              <div>
                <q-btn
                  v-if="isValidator && blindAnnotationMode"
                  flat
                  color="default"
                  icon="analytics"
                  :loading="table.exporting"
                  :disable="(visibility === 0 && isGuest) || table.selected.length !== 1"
                  @click="exportEvaluation()"
                ></q-btn>
                <q-tooltip content-class="text-white bg-primary">
                  {{ $t('projectView.tooltipExportEvaluation') }}
                </q-tooltip>
              </div>

              <!-- single and main button for deletion -->
              <q-btn
                v-if="isAdmin"
                flat
                color="default"
                icon="delete_forever"
                :text-color="table.selected.length !== 0 ? 'red' : 'default'"
                :disable="table.selected.length < 1"
                :loading="table.loadingDelete"
                @click="triggerConfirm(deleteSamples)"
              >
                <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">
                  {{ $t('projectView.tooltipDeleteSample[0]') }}
                </q-tooltip>
                <q-tooltip v-else-if="githubSynchronizedRepo" :delay="300" content-class="text-white bg-primary">
                  {{ $t('github.deletionWarning') }}
                </q-tooltip>
                <q-tooltip v-else>
                  {{ $t('projectView.tooltipDeleteSample[1]') }}
                </q-tooltip>
              </q-btn>

              <!-- single and main button for lexicon -->
              <div v-if="canSaveTreeInProject">
                <q-btn
                  flat
                  color="default"
                  icon="playlist_add_check"
                  :loading="table.exporting"
                  :disable="table.selected.length < 1 || isFreezed"
                  @click="isShowLexiconPanel = true"
                />
                <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">
                  {{ $t('projectView.tooltipCreateLexicon[0]') }}
                </q-tooltip>
                <q-tooltip v-else :delay="300" class-content="text-white bg-primary">
                  {{ $t('projectView.tooltipCreateLexicon[1]') }}
                </q-tooltip>
              </div>

              <!-- single and main button for parsing -->
              <div v-if="isAdmin">
                <q-btn
                  :disable="isFreezed"
                  flat
                  icon="precision_manufacturing"
                  @click="bootParserPanelToggle()"
                  :color="isShowParsingPanel ? 'primary' : 'default'"
                >
                  <q-tooltip content-class="text-body2 bg-primary">
                    {{ isShowParsingPanel ? $t('projectView.tooltipParsingPanel[1]') : $t('projectView.tooltipParsingPanel[0]') }} Parsing Panel
                  </q-tooltip>
                </q-btn>
              </div>

              <!-- Single and main button for Constructicon -->
              <div>
                <q-btn v-if="canSaveTreeInProject" flat icon="account_tree" @click="isShowConstructiconDialogCop = true">
                  <q-tooltip content-class="text-body2 bg-primary">
                    {{ $t('projectView.tootlipConstructiconPanel') }}
                  </q-tooltip>
                </q-btn>
              </div>

              <!-- Single and main button for synchronization -->
              <div>
                <q-btn
                  v-if="isAllowdedToSync && !githubSynchronizedRepo"
                  :disable="isFreezed"
                  flat
                  icon="fab fa-github"
                  @click="isShowSyncDialog = true"
                >
                </q-btn>
                <q-tooltip>
                  {{ $t('projectView.tooltipSynchronize') }}
                </q-tooltip>
              </div>

              <!-- Button for more options -->
              <div v-if="isAdmin">
                <q-btn-dropdown flat icon="more_vert">
                  <q-list>
                    <q-item v-if="isOwner" clickable v-close-popup @click="freezeProject">
                      <q-item-section avatar>
                        <q-avatar icon="block" />
                      </q-item-section>
                      <q-item-section v-if="!freezed">
                        <q-item-label>{{ $t('projectView.freezeProject[0]') }}</q-item-label>
                      </q-item-section>
                      <q-item-section v-else>
                        <q-item-label>{{ $t('projectView.freezeProject[1]') }}</q-item-label>
                        <q-item-label caption>{{ $t('projectView.freezeProject[2]') }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item clickable :disable="table.selected.length < 1" v-close-popup @click="removeUserTreesDial = true">
                      <q-item-section avatar>
                        <q-avatar icon="person_remove" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('projectView.removeUserTrees[0]') }}</q-item-label>
                        <q-item-label v-if="table.selected.length < 1" caption>{{ $t('projectView.removeUserTrees[1]') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
                <q-tooltip> {{ $t('projectView.tooltipMore') }} </q-tooltip>
              </div>

              <!-- Other github options (only for synchronized projects) -->
              <div v-if="isAllowdedToSync && githubSynchronizedRepo && !isDeleteSync">
                <GithubOptions
                  :projectName="projectName"
                  :repositoryName="githubSynchronizedRepo"
                  :key="reload"
                  @remove="reloadAfterDeleteSynchronization"
                  @pulled="loadProjectData"
                />
                <q-tooltip content-class="text-white bg-primary">
                  {{ $t('projectView.tooltipSynchronizedProject') }} {{ githubSynchronizedRepo }}</q-tooltip
                >
              </div>
            </q-btn-group>
            <!-- End of Options bar -->

            <q-space />

            <q-input v-model="table.filter" dense debounce="300" :placeholder="$t('projectView.search')" text-color="blue-grey-8">
              <template #append>
                <q-icon name="search" />
              </template>
              <q-tooltip :delay="300" content-class="text-white bg-primary">
                {{ $t('projectView.tooltipSearch') }}
              </q-tooltip>
            </q-input>

            <q-space />

            <q-btn flat round dense :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'" class="q-ml-md" @click="props.toggleFullscreen">
              <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipFullscreen') }}</q-tooltip>
            </q-btn>
          </template>

          <template #body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-toggle v-model="props.selected" dense />
              </q-td>
              <q-td key="samplename" :props="props">
                <q-btn
                  :disable="isFreezed"
                  outline
                  color="white"
                  :text-color="$q.dark.isActive ? 'white' : 'black'"
                  class="full-width"
                  :to="'/projects/' + projectName + '/' + props.row.sample_name"
                  icon-right="open_in_browser"
                  no-caps
                  >{{ props.row.sample_name }}</q-btn
                >
              </q-td>
              <q-td key="sentences" :props="props">{{ props.row.sentences }}</q-td>
              <q-td key="tokens" :props="props">{{ props.row.tokens }}</q-td>
              <q-td key="treesFrom" :props="props">
                <div v-if="Object.keys(props.row.treeByUser).length >= 5">
                  {{ props.row.treesFrom.length }} users
                  <q-tooltip>
                    <p v-for="(nSentences, userId) in props.row.treeByUser" :key="userId" :props="userId">{{ userId }} ({{ nSentences }})</p>
                  </q-tooltip>
                </div>
                <div v-else>
                  <div v-for="(nSentences, userId) in props.row.treeByUser" :key="userId" :props="userId">{{ userId }} ({{ nSentences }})</div>
                </div>
              </q-td>
              <q-td key="blindAnnotationLevel" :props="props">
                <q-select
                  v-model="props.row.blindAnnotationLevel"
                  outlined
                  :options="blindAnnotationModeOptions"
                  map-options
                  emit-value
                  label="Blind annotation model"
                  :dense="false"
                  :disable="!isAdmin"
                  @update:model-value="updateBlindAnnotationLevel(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <template v-if="!isFreezed && canExportTrees">
      <GrewSearch
        :sentence-count="sentenceCount"
        :search-scope="projectName"
        :sample-names="selectedSamplesNames"
        :trees-from="getProjectTreesFrom"
        @reload="loadProjectData"
      />
      <RelationTableMain :sample-names="selectedSamplesNames" />
    </template>

    <!-- Settings dialog -->
    <q-dialog v-model="projectSettingsDial" transition-show="slide-up" transition-hide="slide-down">
      <ProjectSettingsView :project-trees-from="getProjectTreesFrom" :projectname="projectName" style="width: 90vw"> </ProjectSettingsView>
    </q-dialog>

    <!--Project information dialog-->
    <q-dialog v-model="simpleProjectInfoDialog">
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">
            {{ $t('projectView.projectInfoDial.title') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="admins.length > 1">
            {{ $t('projectView.projectInfoDial.ifAdmin') }}
          </div>
          <div v-else>{{ $t('projectView.projectInfoDial.else') }}</div>
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item v-for="admin in admins" :key="admin">
              <q-item-label caption>{{ admin }}</q-item-label>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn v-close-popup flat label="OK" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Upload dialog-->
    <UploadDialog v-model:uploadDial="uploadDial" :samples="samples" @uploaded:sample="loadProjectData()" />

    <!--Add project language dialog-->
    <ProjectLangNotif v-if="showAddLangDialog" />

    <!--Export dialog-->
    <q-dialog v-model="isShowExportDialo">
      <ExportDialog :samples="table.selected" />
    </q-dialog>

    <!--Delete confirm dialog-->
    <q-dialog v-model="confirmActionDial">
      <confirm-action :parent-action="confirmActionCallback" :arg1="confirmActionArg1" :target-name="projectName"></confirm-action>
    </q-dialog>

    <!-- Lexicon Panel -->

    <!-- Constructicon Dialog -->
    <q-dialog v-model="isShowConstructiconDialogCop" seamless full-width>
      <ConstructiconDialog />
    </q-dialog>

    <!--Synchronization dialog-->
    <q-dialog v-model="isShowSyncDialog">
      <q-card style="min-width: 50vw">
        <GithubSyncDialog :project-name="projectName" @created="reloadAfterSync"></GithubSyncDialog>
      </q-card>
    </q-dialog>

    <!--Remove Trees-->
    <q-dialog v-model="removeUserTreesDial">
      <q-card style="width: 300vh">
        <q-card-section>
          <div class="text-h6">Remove user trees from the selected samples</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select filled v-model="user" label="Select user" :options="getTreesFrom(table.selected)" />
          <div class="row justify-center">
            <q-btn color="primary" @click="triggerConfirm(removeUserTrees)" label="Remove Trees" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import api from '../api/backend-api';

import ProjectSettingsView from '../components/ProjectSettingsView.vue';
import ConfirmAction from '../components/ConfirmAction.vue';
import UploadDialog from '../components/project/UploadDialog.vue';
import ExportDialog from '../components/project/ExportDialog.vue';
import LexiconMain from '../components/lexicon/LexiconMain.vue';
import GrewSearch from '../components/grewSearch/GrewSearch.vue';
import RelationTableMain from '../components/relationTable/RelationTableMain.vue';
import ParsingPanel from '../components/parsing/ParsingPanel.vue';
import ProjectIcon from '../components/shared/ProjectIcon.vue';
import GithubOptions from '../components/github/GithubOptions.vue';
import GithubSyncDialog from 'src/components/github/GithubSyncDialog.vue';
import ConstructiconDialog from 'src/components/constructicon/ConstructiconDialog.vue';
import ProjectLangNotif from 'src/components/ProjectLangNotif.vue';

import { notifyError, notifyMessage } from 'src/utils/notify';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { useGithubStore } from 'src/pinia/modules/github';
import { sample_t } from 'src/api/backend-types';
import { defineComponent } from 'vue';
import { table_t } from 'src/types/main_types';

export default defineComponent({
  components: {
    ConstructiconDialog,
    ProjectSettingsView,
    ConfirmAction,
    UploadDialog,
    ExportDialog,
    LexiconMain,
    GrewSearch,
    RelationTableMain,
    ParsingPanel,
    ProjectIcon,
    GithubOptions,
    GithubSyncDialog,
    ProjectLangNotif,
  },
  data() {
    const samples: sample_t[] = [];
    const selected: sample_t[] = [];
    const confirmActionCallback: CallableFunction = () => {
      console.log('Callback not init yet');
    };
    const sampleNames: string[] = [];

    const table: table_t<sample_t> = {
      fields: [
        {
          name: 'samplename',
          label: this.$t('projectView.tableFields[0]'),
          sortable: true,
          field: 'samplename',
        },
        {
          name: 'sentences',
          label: this.$t('projectView.tableFields[1]'),
          sortable: true,
          field: 'sentences',
        },
        {
          name: 'tokens',
          label: this.$t('projectView.tableFields[2]'),
          sortable: true,
          field: 'number_tokens',
        },
        {
          name: 'treesFrom',
          label: this.$t('projectView.tableFields[3]'),
          sortable: true,
          field: 'treesFrom',
        },
        {
          name: 'blindAnnotationLevel',
          label: this.$t('projectView.tableFields[4]'),
          sortable: true,
          field: 'blindAnnotationLevel',
        },
      ],
      selected,
      visibleColumns: ['samplename', 'treesFrom', 'tokens', 'sentences'],
      visibleColumnsBlindAnnotationMode: ['samplename', 'blindAnnotationLevel', 'treesFrom', 'tokens', 'sentences'],
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'samplename',
        descending: true,
        page: 1,
        rowsPerPage: 10,
      },
      loadingDelete: false,
      exporting: false,
    };
    return {
      table,
      uploadDial: false,
      projectSettingsDial: false,
      simpleProjectInfoDialog: false,
      confirmActionDial: false,
      isShowParsingPanel: false,
      isShowLexiconPanel: false,
      isDeleteSync: false,
      removeUserTreesDial: false,
      user: '',
      confirmActionCallback,
      confirmActionArg1: '',
      samples,
      blindAnnotationModeOptions: [
        {
          label: '1: validated_visible',
          value: 1,
        },
        {
          label: '2: local_feedback',
          value: 2,
        },
        {
          label: '3: global_feedback',
          value: 3,
        },
        {
          label: '4: no_feedback',
          value: 4,
        },
      ],
      sampleNames,
      window: { width: 0, height: 0 },
      tableKey: 0,
      initLoad: false,
      isShowSyncDialog: false,
      isShowExportDialo: false,
      githubSynchronizedRepo: '',
      reload: 0,
      isShowConstructiconDialogCop: false,
      isShowAddLangDialog: true,
      samplesNumber: 0,
    };
  },
  computed: {
    ...mapState(useProjectStore, [
      'visibility',
      'isAdmin',
      'isGuest',
      'admins',
      'image',
      'blindAnnotationMode',
      'imageSrc',
      'description',
      'isValidator',
      'canSaveTreeInProject',
      'isOwner',
      'freezed',
      'isAllowdedToSync',
      'canExportTrees',
      'language',
    ]),
    ...mapWritableState(useProjectStore, ['freezed']),
    ...mapState(useUserStore, ['isSuperAdmin']),
    ...mapState(useGithubStore, ['reloadCommits']),
    projectName(): string {
      return this.$route.params.projectname as string;
    },
    routePath(): string {
      return this.$route.path;
    },
    sentenceCount(): number {
      return this.samples.map((sample) => sample.sentences).reduce((partialSum, a) => partialSum + a, 0);
    },
    getProjectTreesFrom(): string[] {
      return this.getTreesFrom(this.samples);
    },
    isFreezed(): boolean {
      return !this.isOwner && this.freezed;
    },
    showAddLangDialog(): boolean {
      return this.isAdmin && this.language === null;
    },
    recordsPerPage(): number[] {
      const listRecords = [];
      for (let i = 1; i < this.sampleNames.length / 10; i++) {
        listRecords.push(i * 10);
      }
      listRecords.push(this.sampleNames.length);
      this.table.pagination.rowsPerPage = listRecords[0];
      return listRecords;
    },
    selectedSamplesNames(): string[] {
      return this.table.selected.map((sample) => sample.sample_name);
    },
  },
  watch: {
    reloadCommits(newVal) {
      if (newVal > 0) this.loadProjectData();
    },
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  mounted() {
    this.loadProjectData();
    this.getProjectImage();
    this.notifyFreezedProject();
    document.title = `ArboratorGrew: ${this.projectName}`;
    this.getSynchronizedGithubRepo();
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    ...mapActions(useProjectStore, ['updateProjectSettings', 'getImage']),
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },

    goToRoute() {
      this.$router.push(`/projects/${this.projectName}/samples`);
    },

    reloadAfterSync() {
      this.loadProjectData();
      this.isShowSyncDialog = false;
      this.getSynchronizedGithubRepo();
    },

    reloadAfterDeleteSynchronization() {
      this.isDeleteSync = true;
      this.loadProjectData();
      this.getSynchronizedGithubRepo();
    },

    loadProjectData() {
      this.getProjectSamples();
      this.reload += 1;
    },
    getProjectImage() {
      this.getImage(this.projectName);
    },
    getProjectSamples() {
      api.getProjectSamples(this.projectName as string).then((response) => {
        this.samples = response.data;
        this.samplesNumber = this.samples.length;
        this.sampleNames = [];
        for (const sample of this.samples) {
          this.sampleNames.push(sample.sample_name);
        }
      });
    },

    deleteSamples() {
      const data = { sampleIds: this.table.selected.map((sample) => sample.sample_name)};
      api
        .deleteSamples(this.projectName as string, data )
        .then(() => {
          this.table.selected = [];
          notifyMessage({ message: 'Delete success' });
          this.loadProjectData();
        })
        .catch((error) => {
          notifyError({ error });
        });
      for (const sample of this.table.selected) {
        if (this.githubSynchronizedRepo && this.isOwner) {
          this.deleteSampleFromGithub(sample.sample_name);
        }
      }
    },

    freezeProject() {
      notifyMessage({
        message: this.freezed ? `Your project is unfreezed` : `Your project is freezed the are other collaborators can't add new changes`,
      });
      this.updateProjectSettings(this.projectName, { freezed: !this.freezed });
    },

    notifyFreezedProject() {
      if (this.isFreezed) {
        notifyMessage({ message: `This project is freezed by the owner`, position: 'top', type: 'warning' });
      }
    },

    deleteSampleFromGithub(sampleName: string) {
      api
        .deleteFileFromGithub(this.projectName, sampleName)
        .then(() => {
          notifyMessage({ message: 'Delete from Github' });
          this.loadProjectData();
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    displayWarning() {
      notifyMessage({ message: 'These files will be also deleted from your synchronized Github repository', type: 'warning', position: 'top' });
    },

    bootParserPanelToggle() {
      this.isShowParsingPanel = !this.isShowParsingPanel;
    },
    updateBlindAnnotationLevel(sample: sample_t) {
      setTimeout(() => {
        // IMPORTANT : Since quasar v2 (vue v3), the update method (in q-select) occurs BEFORE the value is updated
        // So we need to use this hack of setTimeout if we want to access to the updated sample.blindAnnotationLevel
        api
          .updateSampleBlindAnnotationLevel(this.projectName as string, sample.sample_name, sample.blindAnnotationLevel)
          .then(() => {
            notifyMessage({ message: 'The new blind annotation level was correctly saved in the server' });
          })
          .catch((error) => {
            notifyError({ error });
          });
      }, 0);
    },
    triggerConfirm(method: CallableFunction) {
      if (this.githubSynchronizedRepo && this.isOwner) this.displayWarning();
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
    },

    searchSamples(rows: sample_t[], terms: any) {
      return rows.filter((row) => row.sample_name.indexOf(terms) !== -1);
    },

    getSynchronizedGithubRepo() {
      api
        .getSynchronizedGithubRepository(this.projectName)
        .then((response) => {
          this.githubSynchronizedRepo = response.data.repositoryName;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    getTreesFrom(samples: sample_t[]) {
      const treesFrom: string[] = [];

      for (const sample of samples) {
        const sampleTreesFrom = sample.treesFrom;
        for (const userId of sampleTreesFrom) {
          if (!treesFrom.includes(userId)) {
            treesFrom.push(userId);
          }
        }
      }
      return treesFrom;
    },

    removeUserTrees() {
      for (const sample of this.table.selected) {
        api
          .deleteUserTrees(this.projectName as string, sample.sample_name, this.user)
          .then(() => {
            notifyMessage({ message: `${this.user} trees are removed successfully` });
            this.removeUserTreesDial = false;
            this.loadProjectData();
          })
          .catch((error) => {
            notifyError({ error });
          });
      }
    },

    exportEvaluation() {
      const projectName = this.projectName as string;
      const sampleName = this.table.selected[0].sample_name;
      const fileName = `${sampleName}_evaluations`;
      api
        .exportEvaluation(projectName, sampleName)
        .then((response) => {
          this.downloadFileAttachement(response.data, fileName);
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    downloadFileAttachement(data: any, fileName: string): void {
      const fileURL = window.URL.createObjectURL(new Blob([data]));
      const fileLink = document.createElement('a');

      fileLink.href = fileURL;
      fileLink.setAttribute('download', `${fileName}.tsv`);
      document.body.appendChild(fileLink);

      fileLink.click();
    },
  },
});
</script>

<style lang="stylus">
.my-sticky-header-table {
  /* max height is important */
  .q-table__middle {
    max-height: 70vh;
    min-height: 20vh;
  }

  .q-table__top, .q-table__bottom, thead tr:first-child th { /* bg color is important for th; just specify one */
    background-color: $grey-1; /* #eeeeee */
  }

  thead tr:first-child th {
    position: sticky;
    top: 0;
    opacity: 1;
    z-index: 2;
  }
}
.q-table__bottom {
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-sticky-header-table-dark {
  /* max height is important */
  .q-table__middle {
    max-height: 70vh;
    min-height: 20vh;
  }

  .q-table__top, .q-table__bottom, thead tr:first-child th { /* bg color is important for th; just specify one */
    background-color: #1d1d1d;
  }

  thead tr:first-child th {
    position: sticky;
    top: 0;
    opacity: 1;
    z-index: 2;
  }
}

/* for limiting overflow on screen */
.tags-input-root {
  max-width: 140px;
}

.project-image {
  height: 120px;
  box-shadow: 0px 0px 8px rgb(204 204 204);
}
</style>
