<template>
  <q-page>
    <EmailCollectDialog v-if="shareEmail" />
    <q-card flat class="full">
      <q-card-section class="q-pa-md row items-start q-gutter-md">
        <q-toolbar class="q-gutter-md">
          <div :class="$q.platform.is.mobile ? 'row': ''">
            <q-toolbar-title :class="($q.dark.isActive ? '' : 'text-primary') + ' text-bold'">
              {{ $t('projectHub.title') }}
            </q-toolbar-title>
          </div>
          <q-btn
            no-caps
            :disable="!isLoggedIn"
            color="primary"
            :label="$t('projectHub.newProject')"
            icon="add"
            size="md"
            @click="creaProjectDial = true"
          >
            <q-tooltip v-if="!isLoggedIn" :delay="300" content-class="text-white bg-primary">
              {{ $t('projectHub.tooltipCreaProject[0]') }}
            </q-tooltip>
            <q-tooltip v-else :delay="300" class-content="text-white bg-primary">
              {{ $t('projectHub.tooltipCreaProject[1]') }}
            </q-tooltip>
          </q-btn>
          <q-btn v-if="isLoggedIn" no-caps :label="$t('projectHub.myProjects')" to="/myprojects" />
        </q-toolbar>
      </q-card-section>
      <q-card-section>
        <q-input outlined v-model="search" bottom-slots :label="$t('projectHub.emptySearch')" type="text" @update:model-value="getProjects()">
          <template #append>
            <div v-for="val in selectedLanguagesForFilter">
              <q-chip removable size="sm" @remove="removeFilter(val)">{{ val }}</q-chip>
            </div>
            <q-btn flat icon="language" color="primary">
              <q-menu>
                <div class="row q-pa-md text-bold">Filter by language</div>
                <q-separator />
                <div class="row q-pa-md">
                  <LanguageSelect :multiple="true" :languages-list="projectsLanguages" @selected-value="getSelectedLanguages" />
                </div>
              </q-menu>
              <q-tooltip>
                Filter projects by language
              </q-tooltip>
            </q-btn>
          </template>
        </q-input>
        <div class="row q-gutter-md" style="justify-content: right">
          <q-select
            v-if="isLoggedIn"
            v-model="projectType"
            dense
            outlined
            style="min-width: 230px"
            :options="projectTypeOptions"
            class="float-right"
            :label="$t('projectHub.projectCategory')"
            @update:model-value="getProjects"
          />
          <q-btn round flat :icon="listMode ? 'grid_view' : 'fas fa-list'" @click="toggleProjectView()">
            <q-tooltip v-if="listMode">
              {{ $t('projectHub.tooltipGridView') }}
            </q-tooltip>
            <q-tooltip v-else>
              {{ $t('projectHub.tooltipListView') }} 
            </q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
      <q-card-section v-if="initLoading" class="row q-pa-md items-start q-gutter-md" style="width: 90vw; height: 60vh">
        <q-card v-for="i in skelNumber" :key="i" style="max-width: 250px; width: 250px">
          <q-skeleton height="150px" square />
          <q-item>
            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" />
              </q-item-label>
              <q-item-label caption>
                <q-skeleton type="text" />
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-card>
      </q-card-section>
      <!-- Here starts the grid view of projects -->
      <q-card-section v-if="!listMode">
        <q-virtual-scroll
          v-if="$q.platform.is.mobile"
          :items="visibleProjects"
          :virtual-scroll-slice-size="30"
          :virtual-scroll-item-size="200"
        >
          <template #default="{ item }">
            <div class="q-pa-md row q-gutter-md">
              <ProjectCard :key="item.id" style="max-width: 80vw" :project="item" :parent-delete-project="deleteProject"></ProjectCard>
            </div>
          </template>
        </q-virtual-scroll>
        <div v-if="!$q.platform.is.mobile" class="q-pa-md row q-gutter-md">
          <ProjectCard
            v-for="project in visibleProjects"
            :key="project.id"
            :style="`max-width: ${projectCardWidth}px;`" 
            :project="project"
            :parent-delete-project="deleteProject"
          ></ProjectCard>
        </div>
        <div class="q-pa-lg flex flex-center">
          <q-pagination v-model="pageIndex" :min="currentPage" :max="totalPages" :input="true" />
        </div>
      </q-card-section>
      <!-- Here starts the list view -->
      <q-card-section v-else>
        <q-list style="width: 100%">
          <q-virtual-scroll
            :items="visibleProjects"
            style="max-height: 100vh; width: 100%"
            :virtual-scroll-slice-size="30"
            :virtual-scroll-item-size="200"
          >
            <template #default="{ item }">
              <ProjectItem :key="item.id" :project="item" :parent-delete-project="deleteProject"></ProjectItem>
            </template>
          </q-virtual-scroll>
        </q-list>
        <div class="q-pa-lg flex flex-center">
          <q-pagination v-model="pageIndex" :min="currentPage" :max="totalPages" :input="true" />
        </div>
      </q-card-section>
    </q-card>
    <CreaProjectCard v-if="creaProjectDial" :parent-get-projects="getProjects" @created="creaProjectDial = false"></CreaProjectCard>
  </q-page>
</template>

<script lang="ts">
import { mapState, mapWritableState } from 'pinia';
import { LocalStorage } from 'quasar';
import { project_extended_t } from 'src/api/backend-types';
import { useProjectStore } from 'src/pinia/modules/project';
import { useUserStore } from 'src/pinia/modules/user';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { defineComponent } from 'vue';

import api from '../api/backend-api';
import CreaProjectCard from 'src/components/project/CreaProjectCard.vue';
import ProjectCard from 'src/components/project/ProjectCard.vue';
import ProjectItem from 'src/components/project/ProjectItem.vue';
import EmailCollectDialog from 'src/components/Index/EmailCollectDialog.vue';
import LanguageSelect from 'src/components/shared/LanguageSelect.vue';

export default defineComponent({
  name: 'ProjectHub',
  components: {
    ProjectCard,
    ProjectItem,
    CreaProjectCard,
    LanguageSelect,
    EmailCollectDialog,
  },
  data() {
    const projects: project_extended_t[] = [];
    const visibleProjects: project_extended_t[] = [];
    const projectsLanguages: { index: number; name: string }[] = [];
    return {
      projects,
      visibleProjects,
      projectTypeOptions: [
        { value: 'all_projects', label: this.$t('projectHub.allProjects') },
        { value: 'my_projects', label: this.$t('projectHub.myProjects') },
        { value: 'other_projects', label: this.$t('projectHub.otherProjects') },
        { value: 'my_old_projects', label: this.$t('projectHub.myOldProjects') },
      ],
      projectType: { value: 'all_projects', label: this.$t('projectHub.allProjects') },
      search: '',
      listMode: true,
      creaProjectDial: false,
      initLoading: false,
      skelNumber: [...Array(5).keys()],
      currentPage: 1,
      pageIndex: 1,
      projectCardWidth: 0,
      selectedLanguagesForFilter: [],
      projectsLanguages,
      totalPages: 1,
    };
  },
  computed: {
    ...mapState(useUserStore, ['isLoggedIn', 'username', 'shareEmail']),
    ...mapWritableState(useProjectStore, ['reloadProjects']),
  },
  watch: {
    pageIndex() {
      this.getProjects();
    },
    reloadProjects(newVal) {
      if (newVal) {
        this.getProjects();
        this.reloadProjects = false;
      }
    },
    selectedLanguagesForFilter: {
      handler() {
        this.getProjects();
      },
      deep: true,
    },
  },
  mounted() {
    document.title = `ArboratorGrew: ${this.$t('projectHub.title')}`;
    this.initLoading = true;
    this.listMode = LocalStorage.getItem('project_view') || false;
    this.getProjects();
    this.getProjectsLanguages();
    this.projectCardWidth = Math.trunc(window.innerWidth / 7);
  },
  methods: {
    toggleProjectView() {
      this.listMode = !this.listMode;
      LocalStorage.set('project_view', this.listMode);
    },
    getProjectsLanguages() {
      api
        .getProjectsLanguages()
        .then((response) => {
          this.projectsLanguages = response.data.map((lang: string, index: number) => ({ index: index + 1, name: lang }));
        })
        .catch((error) => {
          notifyError({ error, caller: 'getProjectsLanguages' });
        });
    },
    getProjects() {
      const languagesToFilter = this.selectedLanguagesForFilter.map((lang) => lang as string);
      api
        .getProjects(this.pageIndex, this.projectType.value, this.search, languagesToFilter)
        .then((response) => {
          this.projects = response.data.projects as project_extended_t[];
          this.visibleProjects = this.projects;
          this.totalPages = response.data.totalPages;
          this.initLoading = false;
        })
        .catch((error) => {
          notifyError({ error, caller: 'getProjects' });
        });
    },
    deleteProject(projectName: string) {
      api
        .deleteProject(projectName)
        .then(() => {
          notifyMessage({ message: `Project ${projectName} deleted` });
          this.getProjects();
        })
        .catch((error) => {
          notifyError({ error, caller: 'deleteProject' });
        });
    },
    getSelectedLanguages(value: any) {
      this.selectedLanguagesForFilter = value;
    },
    removeFilter(val: string) {
      this.selectedLanguagesForFilter.splice(this.selectedLanguagesForFilter.map((val) => val as string).indexOf(val), 1);
    },
  },
});
</script>
