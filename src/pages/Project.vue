<template>
  <q-page id="container" class="custom-frame1">
    <div class="q-pa-md">
      <q-card flat style="max-width: 100%;">
        <q-card-section>
          <div class="row q-pa-md justify-between flex flex-center">
            <div class="col-4 justify-center">
              <div class="text-h5 text-weight-bold">
                {{ $t('projectView.project') }} {{ name }}
                <span>
                  <ProjectVisibility :visibility="visibility" :blindAnnotationMode="blindAnnotationMode"></ProjectVisibility>
                </span>
                <span v-if="syncGithubRepo">
                  <q-chip outline color="secondary" size="sm" >Synchronized with {{ syncGithubRepo }}</q-chip>
                </span>
              </div>
              <div class="text-body2">
                {{ description }}
              </div>
              <div class="text-caption text-weight-medium" :class="$q.dark.isActive ? 'white' : 'grey-8' ">
                Created by
                <span style="text-decoration: underline;">{{ admins[0] }}</span>
              </div>
            </div>
            <div v-if="!$q.platform.is.mobile" class="col-4" style="display: flex; justify-content: flex-end">
              <q-img 
                style="height: 170px; max-width: 300px" 
                :src="image ? image: '/images/small.niko-photos-tGTVxeOr_Rs-unsplash.jpg'" 
                class="rounded-borders"
                alt="project_image"
              />
            </div>
          </div>
          <q-separator />
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div class="row text-h6">
            Project overview 
            <span>
              <q-icon name="trending_up"></q-icon>
            </span>
          </div>
          <div class="row justify-between q-gutter-md">
            <q-card flat bordered class="col">
              <q-card-section>
                88
              </q-card-section>
            </q-card>
            <q-card flat bordered class="col">
              <q-card-section>
                88
              </q-card-section>
            </q-card>
            <q-card flat bordered class="col">
              <q-card-section>
                88
              </q-card-section>
            </q-card>
          </div>
          <q-separator />
        </q-card-section>
        <q-card-section>
          <div class="row q-gutter-md" style="justify-content: right;">
            <q-btn
              v-if="isAllowdedToSync && !syncGithubRepo" 
              no-caps 
              color="primary" 
              label="Synchronize with Github" 
              icon="fab fa-github" 
              @click="syncGithubDial= true" 
              />
            <div v-if="isAllowdedToSync && syncGithubRepo">
              <GithubOptions
                :projectName="name"
                :repositoryName="syncGithubRepo"
                :key="reload"
                @pulled="loadProjectData"
                @remove="loadAfterGithubSync"
              />
              <q-tooltip content-class="text-white bg-primary">
                {{ $t('projectView.tooltipSynchronizedProject') }} {{ syncGithubRepo }}
              </q-tooltip>
            </div>
            <q-btn 
              v-if="isAdmin"
              no-caps 
              outline 
              color="primary" 
              label="Settings" 
              icon="tune"  
              @click="projectSettingsDial = true" 
              />
            <q-btn 
              v-if="isAdmin"
              no-caps 
              unelevated 
              color="primary" 
              label="New sample" 
              icon="add"  
              @click="uploadDial = true" 
              />
          </div>
          <q-tabs
            v-model="tab"
            no-caps
            inline-label
            align="left"
            class="primary"
          >
            <q-tab name="samples" label="Samples" />
            <q-tab name="grew" label="Grew" />
            <q-tab name="relation_table" label="Relation Table"/>
            <q-tab name="lexicon" label="Lexicon" />
            <q-tab v-if="isAdmin" name="parser" label="Parser" />
            <q-tab name="constructicon" label="constructicon" /> 
          </q-tabs>
          <q-tab-panels v-model="tab">
            <q-tab-panel class="q-pa-none" name="samples">
              <ProjectOptions :selected-samples="selectedSamples" @unselect="unselectSamples = true"></ProjectOptions>
              <ProjectTable 
                :key="reload" 
                :samples="samples" 
                :parent-unselect-samples="unselectSamples" 
                @selected-samples="getSelectedSamples"
              ></ProjectTable>
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="grew">
              <GrewSearch
                :search-scope="name"
                :samples="samples"
                @reload="loadProjectData"
              />
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
          <GithubSyncDialog :projectName="name" @created="loadAfterGithubSync()" />
        </q-card>
      </q-dialog>
      <q-dialog v-model="projectSettingsDial">
        <ProjectSettingsView :projectName="name" :samples="samples" />
      </q-dialog>
      <UploadDialog v-model:uploadDial="uploadDial" :samples="samples" @uploaded:sample="loadProjectData()" />
    </div>
  </q-page>
</template>

<script lang="ts">
import api from '../api/backend-api';

import ProjectSettingsView from '../components/ProjectSettingsView.vue';
import UploadDialog from '../components/project/UploadDialog.vue';
import LexiconMain from '../components/lexicon/LexiconMain.vue';
import ParsingPanel from '../components/parsing/ParsingPanel.vue';
import ProjectVisibility from 'src/components/shared/ProjectVisibility.vue';
import ProjectTable from 'src/components/project/ProjectTable.vue';
import ProjectOptions from 'src/components/project/ProjectOptions.vue';
import RelationTable from 'src/components/relationTable/RelationTable.vue';
import GrewSearch from 'src/components/grewSearch/GrewSearch.vue';
import ConstructiconDialog from 'src/components/constructicon/ConstructiconDialog.vue';
import GithubSyncDialog from 'src/components/github/GithubSyncDialog.vue';
import GithubOptions from 'src/components/github/GithubOptions.vue';

import { mapState } from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
import { useGithubStore } from 'src/pinia/modules/github';
import { notifyError } from 'src/utils/notify';
import { sample_t } from 'src/api/backend-types';

import { defineComponent } from 'vue';

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
      tab: 'samples'
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
    ]),
    ...mapState(useGithubStore, ['reloadCommits']),
    projectName(): string {
      return this.$route.params.projectname as string;
    }
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
      api.getProjectSamples(this.projectName).then((response) => {
        this.samples = response.data;
        this.sampleNames = this.samples.map((sample) => sample.sample_name); 
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


