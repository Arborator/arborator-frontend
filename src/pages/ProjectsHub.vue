<template>
  <q-page>
    <EmailCollectDialog v-if="shareEmail" />
    <q-card flat class="full">
      <q-card-section class="q-pa-md row items-start q-gutter-md">
        <q-toolbar class="q-gutter-md">
          <q-toolbar-title :class="($q.dark.isActive ? '' : 'text-primary') + ' text-bold'">
            {{ $t('projectHub.title') }}
          </q-toolbar-title>
          <q-btn 
            no-caps 
            :disable="!isLoggedIn" 
            color="primary" 
            label="New Project" 
            icon="add" 
            size="md"
            @click="creaProjectDial = true"
          >
            <q-tooltip v-if="!isLoggedIn" :delay="300" content-class="text-white bg-primary">
              {{ $t('projectHub.tooltipCreaProject[0]') }}
            </q-tooltip>
            <q-tooltip v-else :delay="300" class-content="text-white bg-primary">
              {{ $t('projectHub.tooltipCreaProject[1 ]') }}
            </q-tooltip>
          </q-btn>
          <q-btn v-if="isLoggedIn" no-caps  label="My Projects" />
        </q-toolbar>
      </q-card-section>
      <q-card-section>
        <q-input
          outlined
          v-model="search"
          bottom-slots
          :label="$t('projectHub.emptySearch')"
          type="text"
          @input="searchProject(search)"
          @keyup.enter="searchProject(search)"
        >
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
            </q-btn>
          </template>
        </q-input>
        <div class="row q-gutter-md" style="justify-content: right;">
          <q-select
            v-if="isLoggedIn"
            v-model="projectType"
            dense
            outlined
            style="min-width: 230px"
            :options="projectTypeOptions"
            class="float-right"
            :label="$t('projectHub.projectCategory')"
          />
          <q-btn :color="listMode ? 'primary':''" round flat icon="fas fa-list" @click="toggleProjectView()" />
          <q-btn :color="!listMode ? 'primary':''" round flat icon="grid_view" @click="toggleProjectView()" /> 
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
          :items="filteredProjects"
          style="max-height: 60vh; width: 80vw"
          :virtual-scroll-slice-size="30"
          :virtual-scroll-item-size="200"
        >
          <template #default="{ item }">
            <ProjectCard
              :key="item.id"
              style="max-width: 80vw"
              :project="item"
              :parent-delete-project="deleteProject"
            ></ProjectCard>
          </template>
        </q-virtual-scroll>
        <div v-if="!$q.platform.is.mobile" class="q-pa-md row items-start q-gutter-md">
          <ProjectCard
            v-for="project in filteredProjects"
            :key="project.id"
            style="max-width: 270px"
            :project="project"
            :parent-delete-project="deleteProject"
          ></ProjectCard>
        </div>
      </q-card-section>
      <!-- Here starts the list view -->
      <q-card-section v-else>
        <q-list style="width: 100%">
          <q-virtual-scroll
            :items="paginatedProjects"
            style="max-height: 100vh; width: 100%"
            :virtual-scroll-slice-size="30"
            :virtual-scroll-item-size="200"
          >
            <template #default="{ item }">
              <ProjectItem
                v-if="isLoggedIn || !isOld(item)"
                :key="item.id"
                :project="item"
                :parent-delete-project="deleteProject"
              ></ProjectItem>
            </template>
          </q-virtual-scroll>
        </q-list>
        <div class="q-pa-lg flex flex-center">
          <q-pagination v-model="pageIndex" :min="currentPage" :max="Math.ceil(filteredProjects.length / totalItemPerPage)" :input="true" />
        </div>
      </q-card-section>
    </q-card>
    <CreaProjectCard v-if="creaProjectDial" :parent-get-projects="getProjects" @created="creaProjectDial = false"></CreaProjectCard>
    <q-dialog v-model="confirmActionDial">
      <ConfirmAction :parent-action="confirmActionCallback" :arg1="confirmActionArg1"></ConfirmAction>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import api from '../api/backend-api';
import ProjectCard from '../components/ProjectCard.vue';
import ProjectItem from '../components/ProjectItem.vue';
import CreaProjectCard from '../components/CreaProjectCard.vue';
import ConfirmAction from '../components/ConfirmAction.vue';
import LanguageSelect from 'src/components/shared/LanguageSelect.vue';
import EmailCollectDialog from 'src/components/Index/EmailCollectDialog.vue';

import { LocalStorage } from 'quasar';
import { mapState, mapWritableState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { project_extended_t } from 'src/api/backend-types';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProjectHub',
  components: {
    ProjectCard,
    ProjectItem,
    CreaProjectCard,
    ConfirmAction,
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
        this.$t('projectHub.allProjects'),
        this.$t('projectHub.myProjects'),
        this.$t('projectHub.otherProjects'),
        this.$t('projectHub.myOldProjects'),
        this.$t('projectHub.otherOldProjects'),
      ],
      projectType: '',
      search: '',
      listMode: true,
      creaProjectDial: false,
      initLoading: false,
      skelNumber: [...Array(5).keys()],
      confirmActionDial: false,
      confirmActionCallback: null,
      confirmActionArg1: '',
      ayear: -3600 * 24 * 365,
      currentPage: 1,
      pageIndex: 1,
      totalItemPerPage: 10,
      selectedLanguagesForFilter: [],
      projectsLanguages,
    };
  },
  computed: {
    ...mapState(useUserStore, ['isLoggedIn', 'username', 'shareEmail']),
    ...mapWritableState(useProjectStore, ['reloadProjects']),
    myProjects(): project_extended_t[] {
      return this.visibleProjects.filter((project) => {
        return (this.isCreatedByMe(project) || this.isSharedWithMe(project) || this.haveTreeInProject(project)) && !this.isOld(project);
      });
    },
    myOldProjects(): project_extended_t[] {
      return this.visibleProjects.filter((project) => {
        return (this.isCreatedByMe(project) || this.isSharedWithMe(project)) && this.isOld(project);
      });
    },
    otherProjects(): project_extended_t[] {
      return this.visibleProjects.filter((project) => {
        return !(this.isCreatedByMe(project) || this.isSharedWithMe(project)) && !this.isOld(project);
      });
    },
    otherOldProjects(): project_extended_t[] {
      return this.visibleProjects.filter((project) => {
        return !(this.isCreatedByMe(project) || this.isSharedWithMe(project)) && this.isOld(project);
      });
    },
    filteredProjects(): project_extended_t[] {
      if (this.projectType === '' || this.projectType === this.$t('projectHub.allProjects')) {
        return this.visibleProjects;
      } else if (this.projectType === this.$t('projectHub.myProjects')) {
        return this.myProjects;
      } else if (this.projectType === this.$t('projectHub.otherProjects')) {
        return this.otherProjects;
      } else if (this.projectType === this.$t('projectHub.myOldProjects')) {
        return this.myOldProjects;
      } else {
        return this.otherOldProjects;
      }
    },
    paginatedProjects(): project_extended_t[] {
      return this.filteredProjects.slice(
        (this.pageIndex - 1) * this.totalItemPerPage,
        (this.pageIndex - 1) * this.totalItemPerPage + this.totalItemPerPage
      );
    },
  },
  watch: {
    reloadProjects(newVal) {
      if (newVal) {
        this.getProjects();
        this.reloadProjects = false;
      }
    },
  },
  mounted() {
    document.title = `ArboratorGrew: ${this.$t('projectHub.title')}`;
    this.initLoading = true;
    this.listMode = LocalStorage.getItem('project_view') || false;
    this.getProjects();
  },
  methods: {
    toggleProjectView() {
      this.listMode = !this.listMode;
      LocalStorage.set('project_view', this.listMode)
    },
    isCreatedByMe(project: project_extended_t) {
      return project.admins[0] === this.username;
    },
    isSharedWithMe(project: project_extended_t) {
      const projectMember = [...project.admins, ...project.annotators, ...project.validators, ...project.guests];
      return projectMember.includes(this.username);
    },
    haveTreeInProject(project: project_extended_t) {
      return project.users.includes(this.username);
    }, 
    isOld(project: project_extended_t) {
      // either not used since more than a year or empty and older than an hour or the project has no admins
      return project.lastAccess < this.ayear || (project.numberSamples < 1 && project.lastAccess < -3600) || project.admins.length === 0;
    },
    getProjects() {
      api
        .getProjects()
        .then((response) => {
          this.projects = response.data as project_extended_t[];
          this.visibleProjects = response.data as project_extended_t[];
          this.projectsLanguages = [...new Set(this.projects.map((project) => project.language))]
            .filter((language) => language !== '' && language !== null)
            .map((language, i) => ({ index: i + 1, name: language }));
          this.sortProjects();
          this.initLoading = false;
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    sortProjects() {
      this.visibleProjects.sort((a, b) => b.lastAccess - a.lastAccess);
    },
    deleteProject(projectName: string) {
      api
        .deleteProject(projectName)
        .then(() => {
          notifyMessage({ message: `Project ${projectName} deleted` });
          this.getProjects();
        })
        .catch((error) => {
          notifyError({ error });
        });
    },
    searchProject(pattern: string) {
      const lowercasePattern = pattern.toLowerCase();
      this.visibleProjects = this.projects.filter((project) => {
        const projectNameIncludesPattern = project.projectName.toLowerCase().includes(lowercasePattern);
        const projectMatchesLangFilter =
          this.selectedLanguagesForFilter.length === 0 || this.selectedLanguagesForFilter.map((lang) => lang as string).includes(project.language);
        return projectNameIncludesPattern && projectMatchesLangFilter;
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
<style scoped>
.clickable:hover {
  cursor: pointer;
}
</style>
