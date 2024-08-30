<template>
  <q-page id="container" class="custom-frame1">
    <div class="q-pa-md">
      <q-card flat style="max-width: 100%">
        <q-card-section>
          <Breadcrumbs :height="40" :font-size="20" />
        </q-card-section>
        <q-card-section>
          <div class="row q-pa-md justify-between flex flex-center">
            <div class="col-4 justify-center">
              <div class="text-h5 text-weight-bold">
                "{{ name }}"
                <span>
                  <ProjectVisibility :visibility="visibility" :blindAnnotationMode="blindAnnotationMode"></ProjectVisibility>
                </span>
                <span v-if="syncGithubRepo && !blindAnnotationMode">
                  <q-chip outline color="secondary" size="sm">Synchronized with {{ syncGithubRepo }}</q-chip>
                </span>
              </div>
              <div class="text-body2">
                {{ description }}
              </div>
              <div class="text-caption text-weight-medium" :class="$q.dark.isActive ? 'white' : 'grey-8'">
                {{ $t('projectView.createdBy') }} "{{ admins[0] }}"
              </div>
            </div>
            <div v-if="!$q.platform.is.mobile" class="col-4" style="display: flex; justify-content: flex-end">
              <q-img
                style="height: 170px; max-width: 300px"
                :src="image ? image : '/images/small.niko-photos-tGTVxeOr_Rs-unsplash.jpg'"
                class="rounded-borders"
                alt="project_image"
              />
            </div>
          </div>
          <q-separator />
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <StatisticsProject v-if="sampleNames.length" :project-name="projectName" :sample-names="sampleNames"></StatisticsProject>
        </q-card-section>
        <q-card-section>
          <div class="row q-gutter-md" style="justify-content: right">
            <q-btn
              v-if="isAllowdedToSync && !syncGithubRepo"
              no-caps
              color="primary"
              :label="$t('projectView.tooltipSyncGit')"
              icon="fab fa-github"
              @click="syncGithubDial = true"
            >
            </q-btn>
            <div v-if="isAllowdedToSync && syncGithubRepo">
              <GithubOptions
                :projectName="projectName"
                :repositoryName="syncGithubRepo"
                :key="reload"
                @pulled="loadProjectData"
                @remove="loadAfterGithubSync"
              />
              <q-tooltip content-class="text-white bg-primary"> {{ $t('projectView.tooltipSynchronizedProject') }} {{ syncGithubRepo }} </q-tooltip>
            </div>
            <q-btn v-if="isAdmin" no-caps outline color="primary" :label="$t('projectView.settings')" icon="tune" @click="projectSettingsDial = true">
              <q-tooltip>
                {{ $t('projectView.tooltipSettings') }}
              </q-tooltip>
            </q-btn>
            <q-btn v-if="isAdmin" no-caps unelevated color="primary" :label="$t('projectView.newSample')" icon="add" @click="uploadDial = true">
              <q-tooltip>
                {{ $t('projectView.tooltipAddSample') }}
              </q-tooltip>
            </q-btn>
          </div>
          <q-tabs v-model="tab" no-caps inline-label align="left" class="primary">
            <q-tab name="samples" :label="$t('projectView.projectTabs[0]')" />
            <q-tab name="grew" :label="$t('projectView.projectTabs[1]')" />
            <q-tab name="relation_table" :label="$t('projectView.projectTabs[2]')" />
            <q-tab name="lexicon" :label="$t('projectView.projectTabs[3]')" />
            <q-tab v-if="isAdmin" name="parser" :label="$t('projectView.projectTabs[4]')" />
            <q-tab name="constructicon" :label="$t('projectView.projectTabs[5]')" />
          </q-tabs>
          <q-tab-panels keep-alive v-model="tab">
            <q-tab-panel class="q-gutter-md" name="samples">
              <ProjectOptions
                :selected-samples="selectedSamples"
                :canDeleteFromGithub="isAllowdedToSync && syncGithubRepo !== undefined"
                @unselect="unselectSamples = true"
                @reload="loadProjectData"
              ></ProjectOptions>
              <ProjectTable
                :key="reload"
                :samples="samples"
                :parent-unselect-samples="unselectSamples"
                @selected-samples="getSelectedSamples"
              ></ProjectTable>
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="grew">
              <GrewSearch :search-scope="projectName" :samples="samples" @reload="loadProjectData" />
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="parser">
              <ParsingPanel :samples="samples" :parentGetProjectSamples="getProjectSamples"></ParsingPanel>
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="lexicon">
              <LexiconMain :sample-ids="sampleNames"></LexiconMain>
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="relation_table">
              <RelationTable :samples="samples"></RelationTable>
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="constructicon">
              <ConstructiconDialog />
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
      <q-dialog v-model="syncGithubDial">
        <q-card style="min-width: 50vw">
          <GithubSyncDialog :projectName="projectName" @created="loadAfterGithubSync()" />
        </q-card>
      </q-dialog>
      <q-dialog v-model="projectSettingsDial">
        <ProjectSettingsView :projectName="projectName" :samples="samples" />
      </q-dialog>
      <UploadDialog v-model:uploadDial="uploadDial" :samples="samples" @uploaded:sample="loadProjectData()" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapState, mapWritableState } from 'pinia';
import { sample_t } from 'src/api/backend-types';
import { useGithubStore } from 'src/pinia/modules/github';
import { useGrewSearchStore } from 'src/pinia/modules/grewSearch';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError } from 'src/utils/notify';
import { defineComponent } from 'vue';

import api from '../api/backend-api';
import ProjectSettingsView from '../components/project/ProjectSettingsView.vue';
import LexiconMain from '../components/lexicon/LexiconMain.vue';
import ParsingPanel from '../components/parsing/ParsingPanel.vue';
import UploadDialog from '../components/project/UploadDialog.vue';
import ConstructiconDialog from 'src/components/constructicon/ConstructiconDialog.vue';
import GithubOptions from 'src/components/github/GithubOptions.vue';
import GithubSyncDialog from 'src/components/github/GithubSyncDialog.vue';
import GrewSearch from 'src/components/grewSearch/GrewSearch.vue';
import ProjectOptions from 'src/components/project/ProjectOptions.vue';
import ProjectTable from 'src/components/project/ProjectTable.vue';
import RelationTable from 'src/components/relationTable/RelationTable.vue';
import ProjectVisibility from 'src/components/shared/ProjectVisibility.vue';
import StatisticsProject from 'src/components/project/StatisticsProject.vue';
import Breadcrumbs from 'src/layouts/Breadcrumbs.vue';

export default defineComponent({
  components: {
    GrewSearch,
    ProjectSettingsView,
    UploadDialog,
    LexiconMain,
    ParsingPanel,
    ProjectVisibility,
    ProjectTable,
    RelationTable,
    ProjectOptions,
    ConstructiconDialog,
    GithubSyncDialog,
    GithubOptions,
    StatisticsProject,
    Breadcrumbs,
  },
  data() {
    const samples: sample_t[] = [];
    const selectedSamples: sample_t[] = [];
    const sampleNames: string[] = [];
    return {
      samples,
      sampleNames,
      selectedSamples,
      uploadDial: false,
      projectSettingsDial: false,
      syncGithubDial: false,
      isDeleteSync: false,
      unselectSamples: false,
      syncGithubRepo: '',
      reload: 0,
    };
  },
  computed: {
    ...mapState(useProjectStore, [
      'name',
      'description',
      'visibility',
      'image',
      'blindAnnotationMode',
      'admins',
      'isOwner',
      'isAdmin',
      'isValidator',
      'isAllowdedToSync',
      'canExportTrees',
      'language',
      'reloadSamples', 
      'invalidProjectError'
    ]),
    ...mapWritableState(useProjectStore, ['reloadSamples', 'tab']),
    ...mapState(useGithubStore, ['reloadCommits']),
    ...mapWritableState(useGrewSearchStore, ['grewDialog']),
    projectName(): string {
      return this.$route.params.projectname as string;
    },
  },
  mounted() {
    document.title = `ArboratorGrew: ${this.projectName}`;
    this.loadProjectData();
    this.getSynchronizedGithubRepo();
  },
  watch: {
    reloadCommits(newVal) {
      if (newVal > 0) this.loadProjectData();
    },
    reloadSamples(newVal) {
      if (newVal > 0) this.loadProjectData();
    }
  },
  methods: {
    loadProjectData() {
      this.getProjectSamples();
      this.reload += 1;
    },
    loadAfterGithubSync() {
      this.loadProjectData();
      this.getSynchronizedGithubRepo();
      this.syncGithubDial = false;
    },
    getProjectSamples() {
      api
        .getProjectSamples(this.projectName)
        .then((response) => {
          this.samples = response.data;
          this.sampleNames = this.samples.map(sample => sample.sampleName);
          this.reloadSamples = false;
        })
        .catch((error) => {
          notifyError({ error: error });
        });
    },
    getSelectedSamples(value: any) {
      this.selectedSamples = value;
      this.unselectSamples = !this.selectedSamples.length;
    },
    getSynchronizedGithubRepo() {
      api
        .getSynchronizedGithubRepository(this.projectName)
        .then((response) => {
          this.syncGithubRepo = response.data.repositoryName;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
  },
});
</script>
