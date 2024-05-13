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
            <q-btn no-caps outline color="primary" label="Settings" icon="tune"  @click="projectSettingsDial = true" />
            <q-btn no-caps unelevated color="primary" label="New sample" icon="add"  @click="uploadDial = true" />
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
            <q-tab name="parser" label="Parser" />
            <q-tab name="github" label="Github" /> 
          </q-tabs>
          <q-tab-panels v-model="tab">
            <q-tab-panel class="q-pa-none" name="samples">
              <ProjectOptions :selected-samples="selectedSamples" ></ProjectOptions>
              <ProjectTable @selected-samples="getSelectedSamples"></ProjectTable>
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="grew">
              <GrewSearch
                :search-scope="name"
                :sample-names="samples"
                :samples="samples"
                @reload="loadProjectData"
              />
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="parser">
              <ParsingPanel :samples="samples" :parentGetProjectSamples="getProjectSamples"></ParsingPanel>
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="lexicon">
              <LexiconMain :sample-ids="samples.map((sample) => sample.sample_name)"></LexiconMain>
            </q-tab-panel>
            <q-tab-panel class="q-pa-none" name="relation_table">
              <RelationTable :sample-names="samples.map((sample) => sample.sample_name)"></RelationTable>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
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

import { mapState} from 'pinia';
import { useProjectStore } from 'src/pinia/modules/project';
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
  },
  data() {
    const samples: sample_t[] = [];
    const selectedSamples: sample_t[] = [];
    const sampleNames: string[] = [];
    return {
      uploadDial: false,
      projectSettingsDial: false,
      samples,
      sampleNames,
      selectedSamples,
      window: { width: 0, height: 0 },
      reload: 0,
      tab: 'samples'
    };
  },
  computed: {
    ...mapState(useProjectStore, [
      'name',
      'visibility',
      'isAdmin',
      'admins',
      'image',
      'blindAnnotationMode',
      'description',
      'isValidator',
    ]),
  },
  watch: {
    
  },
  created() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  mounted() {
    this.loadProjectData();
    document.title = `ArboratorGrew: ${this.name}`;

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
      this.$router.push(`/projects/${this.name}/samples`);
    },
    loadProjectData() {
      this.getProjectSamples();
      this.reload += 1;
    },
    getProjectSamples() {
      api.getProjectSamples(this.$route.params.projectname as string).then((response) => {
        this.samples = response.data;
        this.sampleNames = [];
        for (const sample of this.samples) {
          this.sampleNames.push(sample.sample_name);
        }
      });
    },
    getSelectedSamples(value: any) {
      this.selectedSamples = value;
    },
  },
});
</script>


