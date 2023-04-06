<template>
  <q-page id="container" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <div>
      <q-card flat style="max-width: 100%">
        <q-card-section class="project-header">
          <q-img class="project-image" :src="cleanedImage" basic>
            <div class="absolute-bottom text-h6" style="padding: 6px">
              <ProjectIcon :visibility="visibility" :exercise-mode="exerciseMode" />
              {{ $t('projectView.project') }} {{ projectName }}
              <q-btn
                v-if="isAdmin"
                flat
                round
                :color="$q.dark.isActive ? 'primary' : ''"
                icon="settings"
                @click="projectSettingsDial = true"
              >
                <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipSettings') }}</q-tooltip>
              </q-btn>
              <q-btn v-else flat round :color="$q.dark.isActive ? 'primary' : ''" icon="settings" @click="simpleProjectInfoDialog = true">
                <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipViewAdmin') }}</q-tooltip>
              </q-btn>
            </div>
          </q-img>
          <div class="text-primary">{{ description }}</div>
        </q-card-section>

        <!-- Lexicon Panel -->
        <q-card-section class="shadow-4" v-if="isShowLexiconPanel">
          <q-bar class="bg-primary text-white">
            <q-space />
            <q-btn @click="isShowLexiconPanel = false" dense flat icon="close">
            </q-btn>
          </q-bar>
          <LexiconMain :sample-id="table.selected"></LexiconMain>
        </q-card-section>

        <!-- Parsing Panel -->
        <q-card-section v-if="isShowParsingPanel">
          <ParsingPanel :samples="samples"></ParsingPanel>
        </q-card-section>

        <q-card-section>
          <q-table
            ref="textsTable"
            :key="tableKey"
            v-model:pagination="table.pagination"
            v-model:selected="table.selected"
            :class="($q.dark.isActive ? 'my-sticky-header-table-dark' : 'my-sticky-header-table') + ' rounded-borders'"
            title="Samples"
            :rows="samples"
            :columns="table.fields"
            row-key="sample_name"
            :loading="table.loading"
            loading-label="loading"
            :filter="table.filter"
            :filter-method="searchSamples"
            binary-state-sort
            :visible-columns="exerciseMode ? table.visibleColumnsExerciseMode : table.visibleColumns"
            selection="multiple"
            :table-header-class="$q.dark.isActive ? 'text-white' : 'text-primary'"
            card-class="shadow-8"
            virtual-scroll
            table-style="max-height:80vh"
            :rows-per-page-options="[30]"
          >
            <template #top="props">
              <q-btn-group flat>
                <q-btn v-if="isAdmin" flat color="default" icon="cloud_upload" @click="uploadDial = true">
                  <q-tooltip v-if="isAdmin" :delay="300" content-class="text-white bg-primary">{{
                    $t('projectView.tooltipAddSample')
                  }}</q-tooltip>
                </q-btn>
                <div>
                  <q-btn
                    flat
                    color="default"
                    icon="cloud_download"
                    :loading="table.exporting"
                    :disable="(visibility === 0 && !isGuest && !isAdmin && !isSuperAdmin) || table.selected.length < 1"
                    @click="exportSamplesZip()"
                  ></q-btn>
                  <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">{{
                    $t('projectView.tooltipExportSample[0]')
                  }}</q-tooltip>
                  <q-tooltip v-else :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipExportSample[1]') }}</q-tooltip>
                </div>

                <div>
                  <q-btn
                    v-if="isTeacher"
                    flat
                    color="default"
                    icon="analytics"
                    :loading="table.exporting"
                    :disable="(visibility === 0 && !isGuest && !isAdmin && !isSuperAdmin) || table.selected.length !== 1"
                    @click="exportEvaluation()"
                  ></q-btn>
                  <q-tooltip content-class="text-white bg-primary"
                    >export evaluations of the students (only works if only one sample is selected)
                  </q-tooltip>
                </div>

                <q-btn v-if="isAdmin" v-show="table.selected.length < 1" flat color="default" icon="delete_forever" disable>
                  <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">{{
                    $t('projectView.tooltipDeleteSample[0]')
                  }}</q-tooltip>
                  <q-tooltip v-else :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipDeleteSample[1]') }}</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="isAdmin"
                  v-show="table.selected.length !== 0"
                  :loading="table.loadingDelete"
                  flat
                  color="default"
                  text-color="red"
                  icon="delete_forever"
                  :disable="!isAdmin && !isSuperAdmin"
                  @click="triggerConfirm(deleteSamples)"
                >
                  <q-tooltip v-if="githubSynchronizedRepo != ''" content-class="text-white bg-primary">This action will delete the file from your synchronized github repository also</q-tooltip>
                  <q-tooltip v-else :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipDeleteSample[1]') }}</q-tooltip>
                </q-btn>
                <div v-if="isProjectMember">
                  <q-btn
                    flat
                    color="default"
                    icon="playlist_add_check"
                    :loading="table.exporting"
                    :disable="table.selected.length < 1"
                    @click="isShowLexiconPanel = true"
                  ></q-btn>
                  <q-tooltip v-if="table.selected.length < 1" :delay="300" content-class="text-white bg-primary">
                    {{ $t('projectView.tooltipCreateLexicon[0]') }}</q-tooltip
                  >
                  <q-tooltip v-else :delay="300" class-content="text-white bg-primary">{{ $t('projectView.tooltipCreateLexicon[1]') }}</q-tooltip>
                </div>
                <!-- single and main button for parsing -->
                <div v-if="canSaveTreeInProject">
                  <q-btn
                    flat
                    icon="precision_manufacturing"
                    @click="bootParserPanelToggle()"
                    :color="isShowParsingPanel ? 'primary' : 'default'"
                  >
                    <q-tooltip content-class="text-body2 bg-primary"
                      >{{ isShowParsingPanel ? $t('projectView.tooltipParsingPanel[1]') : $t('projectView.tooltipParsingPanel[0]') }}Parsing
                      Panel</q-tooltip
                    >
                  </q-btn>
                </div>
                <div v-if="isAllowdedToSync">
                  <GithubOptions :projectName="projectName" :repositoryName="githubSynchronizedRepo" :key="reload" @remove="reloadAfterSynchronization" @pulled="loadProjectData"/>
                  <q-tooltip content-class="text-white bg-primary">This Project is synchronized with {{githubSynchronizedRepo}}</q-tooltip> 
                </div>
              </q-btn-group>

              <q-space />

              <q-input v-model="table.filter" dense debounce="300" placeholder="Search" text-color="blue-grey-8">
                <template #append>
                  <q-icon name="search" />
                </template>
                <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipSearch') }}</q-tooltip>
              </q-input>

              <q-space />

              <q-select
                v-model="table.visibleColumns"
                multiple
                borderless
                dense
                options-dense
                :display-value="$q.lang.table.columns"
                emit-value
                map-options
                :options="filterFields(table)"
                option-value="name"
                style="min-width: 100px"
              >
                <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectView.tooltipSelectVisible') }}</q-tooltip>
              </q-select>

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
                    :disable="props.row.sentences === 0"
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
                <q-td key="annotators" :props="props">
                  <TagInput
                    v-if="isAdmin"
                    v-model="props.row.roles.annotator"
                    role="annotator"
                    :tag-context="props.row"
                    :element-id="props.row.sample_name + 'annotatortag'"
                    :existing-tags="getPossibleUsers"
                    :typeahead="true"
                    typeahead-style="badges"
                    :typeahead-hide-discard="true"
                    :placeholder="$t('projectView.addUser')"
                    :only-existing-tags="true"
                    :typeahead-always-show="false"
                    @tag-added="modifyRole"
                    @tag-removed="modifyRole"
                  ></TagInput>
                  <q-list v-else dense>
                    <q-item v-for="source in props.row.roles.annotator" :key="source" :props="source">
                      <q-item-label caption>{{ source.value }}</q-item-label>
                    </q-item>
                  </q-list>
                </q-td>
                <q-td key="validators" :props="props">
                  <TagInput
                    v-if="isAdmin"
                    v-model="props.row.roles.validator"
                    role="validator"
                    :tag-context="props.row"
                    :element-id="props.row.sample_name + 'validatortag'"
                    :existing-tags="getPossibleUsers"
                    :typeahead="true"
                    typeahead-style="badges"
                    :typeahead-hide-discard="true"
                    :placeholder="$t('projectView.addUser')"
                    :only-existing-tags="true"
                    :typeahead-always-show="false"
                    @tag-added="modifyRole"
                    @tag-removed="modifyRole"
                  ></TagInput>
                  <q-list v-else dense>
                    <q-item v-for="source in props.row.roles.validator" :key="source" :props="source">
                      <q-item-label caption>{{ source.value }}</q-item-label>
                    </q-item>
                  </q-list>
                </q-td>
                <q-td key="treesFrom" :props="props">
                  <q-item-label v-if="props.row.treesFrom.length >= 5" caption>
                    {{ props.row.treesFrom.length }} users
                    <q-tooltip>
                      <p v-for="userId in props.row.treesFrom" :key="userId" :props="userId">
                        {{ userId }}
                      </p>
                    </q-tooltip>
                  </q-item-label>
                  <q-list v-else dense>
                    <q-item v-for="userId in props.row.treesFrom" :key="userId" :props="userId">
                      <q-item-label caption>{{ userId }}</q-item-label>
                    </q-item>
                  </q-list>
                </q-td>
                <q-td key="exerciseLevel" :props="props">
                  <q-select
                    v-model="props.row.exerciseLevel"
                    outlined
                    :options="exerciceModeOptions"
                    map-options
                    emit-value
                    label="exercise level"
                    :dense="false"
                    :disable="!isAdmin"
                    @update:model-value="updateExerciseLevel(props.row)"
                  />
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
      <template v-if="!exerciseMode && !isTeacher">
        <GrewSearch :sentence-count="sentenceCount" :search-scope="projectName" />
        <RelationTableMain />
      </template>

      <!-- upload dialog start -->
      <q-dialog v-model="assignDial" persistent transition-show="slide-up" transition-hide="slide-down">
        <user-table :samples="table.selected"></user-table>
      </q-dialog>
      <UploadDialog v-model:uploadDial="uploadDial" @uploaded:sample="loadProjectData()" />

      <q-dialog v-model="projectSettingsDial" transition-show="slide-up" transition-hide="slide-down">
        <ProjectSettingsView :project-trees-from="getProjectTreesFrom" :projectname="projectName" style="width: 90vw"></ProjectSettingsView>
      </q-dialog>

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

      <q-dialog v-model="confirmActionDial">
        <confirm-action :parent-action="confirmActionCallback" :arg1="confirmActionArg1" :target-name="projectName"></confirm-action>
      </q-dialog>
    </div>
  </q-page>
</template>

<script lang="ts">
import api from '../api/backend-api';

import UserTable from '../components/UserTable.vue';
import TagInput from '../components/TagInput.vue';
import ProjectSettingsView from '../components/ProjectSettingsView.vue';
import ConfirmAction from '../components/ConfirmAction.vue';
import UploadDialog from '../components/project/UploadDialog.vue';
import LexiconMain from '../components/lexicon/LexiconMain.vue';
import GrewSearch from '../components/grewSearch/GrewSearch.vue';
import RelationTableMain from '../components/relationTable/RelationTableMain.vue';
import ParsingPanel from '../components/parsing/ParsingPanel.vue';
import ProjectIcon from '../components/shared/ProjectIcon.vue';
import GithubOptions from '../components/github/GithubOptions.vue';

import {notifyError, notifyMessage} from 'src/utils/notify';
import {mapActions, mapState} from 'pinia';
import {useProjectStore} from 'src/pinia/modules/project';
import {useUserStore} from 'src/pinia/modules/user';
import {sample_roles_t, sample_t, user_sample_roles_t, sample_role_targetrole_t, sample_role_action_t} from 'src/api/backend-types';
import {defineComponent} from 'vue';
import {table_t} from 'src/types/main_types';

export default defineComponent({
  components: {
    UserTable,
    TagInput,
    ProjectSettingsView,
    ConfirmAction,
    UploadDialog,
    LexiconMain,
    GrewSearch,
    RelationTableMain,
    ParsingPanel,
    ProjectIcon,
    GithubOptions
  },
  data() {
    const samples: sample_t[] = [];
    const selected: sample_t[] = [];
    const projectTreesFrom: string[] = [];
    const confirmActionCallback: CallableFunction = () => {
      console.log('Callback not init yet');
    };
    const sampleNames: string[] = [];

    const table: table_t<sample_t> = {
      fields: [
        {
          name: 'samplename',
          label: 'Name',
          sortable: true,
          field: 'samplename',
        },
        {
          name: 'sentences',
          label: 'Nb Sentences',
          sortable: true,
          field: 'sentences',
        },
        {
          name: 'tokens',
          label: 'Nb Tokens',
          sortable: true,
          field: 'number_tokens',
        },
        {
          name: 'annotators',
          label: 'Annotators',
          sortable: true,
          field: 'roles.annotator',
        },
        {
          name: 'validators',
          label: 'Validators',
          sortable: true,
          field: 'roles.validator',
        },
        {
          name: 'profs',
          label: 'Profs',
          sortable: true,
          field: 'roles.prof',
        },
        {
          name: 'treesFrom',
          label: 'Trees From',
          sortable: true,
          field: 'treesFrom',
        },
        {
          name: 'exerciseLevel',
          label: 'Exercise Level',
          sortable: true,
          field: 'exerciseLevel',
        },
      ],
      selected,
      visibleColumns: ['samplename', 'annotators', 'validators', 'treesFrom', 'tokens', 'sentences'],
      visibleColumnsExerciseMode: ['samplename', 'exerciseLevel', 'treesFrom', 'tokens', 'sentences'],
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
    const githubSynchronizedRepo: string = '';
    return {
      table,
      multiple: [],
      options: ['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'],
      tab: 'texts',
      assignDial: false,
      uploadDial: false,
      projectSettingsDial: false,
      simpleProjectInfoDialog: false,
      confirmActionDial: false,
      isShowParsingPanel: false,
      isShowLexiconPanel: false,
      isDeleteSync: false,
      confirmActionCallback,
      confirmActionArg1: '',
      samples,
      projectTreesFrom,
      exerciceModeOptions: [
        {
          label: '1: teacher_visible',
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
      features: [],
      sampleNames,
      window: { width: 0, height: 0 },
      tableKey: 0,
      initLoad: false,
      githubSynchronizedRepo:'',
      reload: 0,
    };
  },
  computed: {
    ...mapState(useProjectStore, [
      'annotationFeatures',
      'visibility',
      'isAdmin',
      'isGuest',
      'guests',
      'admins',
      'image',
      'exerciseMode',
      'cleanedImage',
      'description',
      'isTeacher',
      'isProjectMember',
      'canSaveTreeInProject',
    ]),
    ...mapState(useUserStore, ['isLoggedIn', 'isSuperAdmin', 'loggedWithGithub', 'avatar', 'username']),
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
      const projectTreesFrom: string[] = [];

      for (const sample of this.samples) {
        const sampleTreesFrom = sample.treesFrom;
        for (const userId of sampleTreesFrom) {
          if (!projectTreesFrom.includes(userId)) {
            projectTreesFrom.push(userId);
          }
        }
      }
      return projectTreesFrom;
    },
    getPossibleUsers(){
      const possiblesUsers: user_sample_roles_t[] = []
      for (const admin of this.admins){
        possiblesUsers.push({ key: admin, value: admin });
      }
      for (const guest of this.guests){
        possiblesUsers.push({ key: guest, value: guest })
      }
      return possiblesUsers;
    },
    isAllowdedToSync(): boolean{
      return this.isAdmin && this.loggedWithGithub && this.githubSynchronizedRepo != '' && !this.isDeleteSync;
    }
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  mounted() {
    this.loadProjectData();
    document.title = `ArboratorGrew: ${this.projectName}`;
    this.getSynchronizedGithubRepo();
    
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },

    goToRoute() {
      this.$router.push(`/projects/${this.projectName}/samples`);
    },

    reloadAfterSynchronization () {
      this.isDeleteSync = true;
      this.loadProjectData();
    }, 

    filterFields(tableJson: table_t<unknown>) {
      // to remove some fields from visiblecolumns select options
      return tableJson.fields.filter((obj) => obj.field !== 'syntInfo' && obj.field !== 'cat' && obj.field !== 'redistributions');
    },
    loadProjectData() {
      this.getProjectSamples();
      this.reload +=1;
    },
    getProjectSamples() {
      api.getProjectSamples(this.projectName as string).then((response) => {
        this.samples = response.data;
        this.sampleNames = [];
        for (const sample of this.samples) {
          this.sampleNames.push(sample.sample_name);
        }
      });
    },

    deleteSamples() {
      for (const sample of this.table.selected) {
        api
          .deleteSample(this.projectName as string, sample.sample_name)
          .then(() => {
            this.table.selected = [];
            notifyMessage({ message: 'Delete success' });
            this.loadProjectData();
          })
          .catch((error) => {
            notifyError({ error });
          });
        if (this.githubSynchronizedRepo != ''){
          this.deleteSampleFromGithub(sample.sample_name);
        }
      }
    },

    deleteSampleFromGithub(sampleName: string) {
      api
        .deleteFileFromGithub(this.projectName, this.username, sampleName)
        .then(() => {
          notifyMessage({ message: 'Delete from Github' });
          this.loadProjectData();
        })
        .catch((error) => {
          notifyError({ error });
        });
    },

    displayWarning(){
      if (this.githubSynchronizedRepo != '') notifyMessage({message: 'These files will be also deleted from your synchronized Github repository', type: 'warning', position: 'top'})
    },

    exportSamplesZip() {
      this.table.exporting = true;
      const samplenames = [];
      for (const sample of this.table.selected) {
        samplenames.push(sample.sample_name);
      }
      api
        .exportSamplesZip(samplenames, this.projectName as string)
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `dump_${this.projectName}.zip`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.table.exporting = false;
          notifyMessage({ message: 'Files downloaded' });
          return [];
        })
        .catch((error) => {
          this.table.exporting = false;
          notifyError({ error });
          return [];
        });
    },
    bootParserPanelToggle() {
      this.isShowParsingPanel = !this.isShowParsingPanel;
    },

    /**
     * Used to update tags and table view based on response
     * @param response : the response from backend
     * @param samplename : the sample name to find
     */
    updateTags(roles: sample_roles_t, samplename: string) {
      for (const [i, sample] of this.samples.entries()) {
        if (sample.sample_name === samplename) {
          this.samples[i].roles = roles;
        }
      }
      this.tableKey += 1;
      // this.$refs.textsTable.requestServerInteraction(this.table.pagination);
    },

    reverseTags(value: string, samplename: string, target: sample_role_targetrole_t) {
      for (const [i, sample] of this.samples.entries()) {
        if (sample.sample_name === samplename) {
          const res = this.samples[i].roles[target].filter((name) => name.key !== value);
          this.samples[i].roles[target] = res;
        }
      }
      this.tableKey += 1;
    },
    /*
    Kirian : New method that add/remove annotator/validator to a sample
    */
    modifyRole(slug: { value: string }, context: sample_t, role: sample_role_targetrole_t, action: sample_role_action_t) {
      api
        .modifySampleRole(this.projectName as string, context.sample_name, slug.value, role, action)
        .then((response) => {
          this.updateTags(response.data.roles, context.sample_name);
          notifyMessage({ message: 'New project roles saved on the server', icon: 'save' });
        })
        .catch((error) => {
          this.reverseTags(slug.value, context.sample_name, role);
          notifyError({ error });
        });
    },
    updateExerciseLevel(sample: sample_t) {
      setTimeout(() => {
        // IMPORTANT : Since quasar v2 (vue v3), the update method (in q-select) occurs BEFORE the value is updated
        // So we need to use this hack of setTimeout if we want to access to the updated sample.exerciseLevel
        api
          .updateSampleExerciseLevel(this.projectName as string, sample.sample_name, sample.exerciseLevel)
          .then((response) => {
            notifyMessage({ message: 'The new exercise level was correctly saved in the server' });
          })
          .catch((error) => {
            notifyError({ error });
          });
      }, 0);
    },
    triggerConfirm(method: CallableFunction) {
      this.displayWarning()
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
    },

    searchSamples(rows: sample_t[], terms: any) {
      return rows.filter((row) => row.sample_name.indexOf(terms) !== -1);
    },

    getSynchronizedGithubRepo() {
      api
        .getSynchronizedGithubRepository(this.projectName, this.username)
        .then((response) => {
          this.githubSynchronizedRepo = response.data;
        })
        .catch((error) => {
          notifyError({ error });
        });

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

.my-sticky-header-table-dark {
  /* max height is important */
  .q-table__middle {
    max-height: 70vh;
    min-height: 20vh;
  }

  .q-table__top, .q-table__bottom, thead tr:first-child th { /* bg color is important for th; just specify one */
    background-color: $black-1; /* #eeeeee */
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
