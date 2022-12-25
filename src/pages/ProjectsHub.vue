<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <div class="q-pa-md row items-start q-gutter-md flex flex-center">
      <q-card flat>
        <q-card-section class="q-pa-md row items-start q-gutter-md">
          <q-toolbar class="text-center">
            <q-btn id="createproject" :disable="!isLoggedIn" color="primary" round dense icon="add" @click="creaProjectDial = true">
              <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectHub.tooltipCreaProject') }}</q-tooltip>
            </q-btn>
            <q-btn round dense :icon="listMode ? 'view_module' : 'list'" @click="toggleProjectView()">
              <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectHub.tooltipChangeView') }}</q-tooltip>
            </q-btn>
            <q-toolbar-title :class="($q.dark.isActive ? '' : 'text-primary') + ' text-bold'">
              {{ $t('projectHub.title') }}
            </q-toolbar-title>
            <q-btn round dense icon="question_mark" color="primary" href="https://arborator.github.io/arborator-documentation/#/" target="_blank" >
              <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectHub.tooltipHelp') }}</q-tooltip>
            </q-btn>
          </q-toolbar>
          <q-toolbar class="text-center">
            <q-toolbar-title>
              <!-- <span :class="($q.dark.isActive?'':'text-primary') + ' text-bold'">Projects</span> -->
              <q-input
                v-model="search"
                filled
                bottom-slots
                :label="$t('projectHub.emptySearch')"
                type="text"
                @input="searchProject(search)"
                @keyup.enter="searchProject(search)"
              >
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-toolbar-title>
          </q-toolbar>
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
        <!-- here starts the actual project presentation -->
        <q-card-section v-if="!listMode" style="width: 90vw; height: 60vh">
          <!-- if mobile:  -->
          <q-virtual-scroll
            v-if="$q.platform.is.mobile"
            :items="visibleProjects"
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
                :parent-project-settings="showProjectSettings"
              ></ProjectCard>
            </template>
          </q-virtual-scroll>
          <!-- if not mobile: -->
          <!-- four groups: my projects, my old projects, other projects, other old projects: -->
          <div v-if="isLoggedIn && !$q.platform.is.mobile" class="q-pa-md row items-start q-gutter-md">
            <div v-if="myProjects.length" class="text-h6 col-12">
              <q-chip color="primary" class="category" text-color="white"> {{ $t('projectHub.myProjects') }} </q-chip>
            </div>
            <ProjectCard
              v-for="project in myProjects()"
              :key="project.id"
              style="max-width: 270px"
              :project="project"
              :parent-delete-project="deleteProject"
              :parent-project-settings="showProjectSettings"
            ></ProjectCard>
            <div v-if="isLoggedIn && myOldProjects.length" class="text-h6 col-12">
              <q-chip color="primary" class="category" text-color="white"> {{ $t('projectHub.myOldProjects') }} </q-chip><br />
              <q-chip outline color="negative" class="bg-white text-negative">{{ $t('projectHub.myOldProjectInfo') }}</q-chip>
            </div>
            <ProjectCard v-if="isLoggedIn"
              v-for="project in myOldProjects"
              :key="project.id"
              style="max-width: 270px"
              :project="project"
              :parent-delete-project="deleteProject"
              :parent-project-settings="showProjectSettings"
            ></ProjectCard>
          </div>
          <div v-if="!$q.platform.is.mobile" class="q-pa-md row items-start q-gutter-md">
            <div v-if="isLoggedIn && otherProjects.length" class="text-h6 col-12">
              <q-chip color="primary" class="category" text-color="white"> {{ $t('projectHub.otherProjects') }} </q-chip>
            </div>
            <ProjectCard
              v-for="project in otherProjects"
              :key="project.id"
              style="max-width: 250px"
              :project="project"
              :parent-delete-project="deleteProject"
              :parent-project-settings="showProjectSettings"
            ></ProjectCard>
            <div v-if="isLoggedIn && otherOldProjects.length" class="text-h6 col-12">
              <q-chip color="primary" class="category" text-color="white">{{ $t('projectHub.otherOldProjects') }}</q-chip
              ><br />
              <q-chip outline color="negative" class="bg-white text-negative">{{ $t('projectHub.otherOldProjectInfo') }}</q-chip>
            </div>
            <ProjectCard v-if="isLoggedIn"
              v-for="project in otherOldProjects"
              :key="project.id"
              style="max-width: 250px"
              :project="project"
              :parent-delete-project="deleteProject"
              :parent-project-settings="showProjectSettings"
            ></ProjectCard>
          </div>
        </q-card-section>
        <!-- here starts the list mode -->
        <q-card-section v-if="listMode" style="width: 90vw; height: 60vh">
          <q-list style="width: 100%" bordered>
            <q-virtual-scroll
              :items="visibleProjects"
              style="max-height: 60vh; width: 100%"
              :virtual-scroll-slice-size="30"
              :virtual-scroll-item-size="200"
            >
              <template #default="{ item }">
                <ProjectItem v-if="isLoggedIn || !isOld(item)"
                  :key="item.id"
                  :project="item"
                  :parent-delete-project="deleteProject"
                  :parent-project-settings="showProjectSettings"
                ></ProjectItem>
              </template>
            </q-virtual-scroll>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="creaProjectDial" transition-show="fade" transition-hide="fade">
      <CreaProjectCard :parent-get-projects="getProjects"></CreaProjectCard>
    </q-dialog>

    <q-dialog v-model="projectSettingsDial" transition-show="slide-up" transition-hide="slide-down">
      <ProjectSettingsView :projectname="projectnameTarget" style="width: 90vw"></ProjectSettingsView>
    </q-dialog>

    <q-dialog v-model="confirmActionDial">
      <ConfirmAction :parent-action="confirmActionCallback" :arg1="confirmActionArg1"></ConfirmAction>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { openURL } from 'quasar';
import { useStorage } from 'vue3-storage';
import api from '../api/backend-api';
import ProjectCard from '../components/ProjectCard.vue';
import ProjectItem from '../components/ProjectItem.vue';
import CreaProjectCard from '../components/CreaProjectCard.vue';
import ProjectSettingsView from '../components/ProjectSettingsView.vue';
import ConfirmAction from '../components/ConfirmAction.vue';
import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { defineComponent } from 'vue';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { project_extended_t } from 'src/api/backend-types';
import { StorageInterface } from 'vue3-storage/packages/types';

export default defineComponent({
  name: 'ProjectHub',
  components: {
    ProjectCard,
    ProjectItem,
    CreaProjectCard,
    ProjectSettingsView,
    ConfirmAction,
  },
  data() {
    const projects: project_extended_t[] = [];
    const visibleProjects: project_extended_t[] = [];
    const storage: StorageInterface = useStorage();
    return {
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      projects,
      visibleProjects,
      projectDifference: false,
      hover: false,
      search: '',
      listMode: true,
      creaProjectDial: false,
      projectSettingsDial: false,
      projectnameTarget: '',
      initLoading: false,
      loadingProjects: true,
      skelNumber: [...Array(5).keys()],
      confirmActionDial: false,
      confirmActionCallback: null,
      confirmActionArg1: '',
      storage,
      ayear: -3600 * 24 * 365,
      userId: '',
    };
  },
  computed: {
    ...mapState(useUserStore, ['isLoggedIn']),

    myOldProjects(): project_extended_t[] {
      return this.visibleProjects.filter((project) => {
        return (this.isCreatedByMe(project)||this.isSharedWithMe(project)) && this.isOld(project);
      });
    },
    otherProjects(): project_extended_t[] {
      return this.visibleProjects.filter((project) => {
        return !(this.isCreatedByMe(project)||this.isSharedWithMe(project)) && !this.isOld(project);
      });
    },
    otherOldProjects(): project_extended_t[] {
      return this.visibleProjects.filter((project) => {
        return !(this.isCreatedByMe(project)||this.isSharedWithMe(project)) && this.isOld(project);
      });
    },
  },
  mounted() {
    document.title = `ArboratorGrew: ${this.$t('projectHub.title')}`;
    this.storage = useStorage();
    this.initLoading = true;
    this.userId = useUserStore().id;
    // this.listMode = this.$storage.getStorageSync("project_view", false);
    this.listMode = this.storage.getStorageSync('project_view') || false;
    this.getProjects();
  },
  methods: {
    openURL,
    myProjects() {
      return this.visibleProjects.filter((project) => {
        return (this.isCreatedByMe(project)||this.isSharedWithMe(project)) && !this.isOld(project);
      });
    },
    getProjects() {
      this.loadingProjects = true;
      api
        .getProjects()
        .then((response) => {
          this.projects = response.data as project_extended_t[];
          this.visibleProjects = response.data as project_extended_t[];
          this.sortProjects();
          this.loadingProjects = false;
          this.initLoading = false;
        })
        .catch((error) => {
          notifyError({ error });
          this.loadingProjects = false;
        });
    },
    searchProject(pattern: string) {
      this.visibleProjects = this.projects.filter((project) => {
        return project.projectName.toLowerCase().includes(pattern.toLowerCase());
      });
    },
    sortProjects() {
      // if (!this.isLoggedIn) return;
      this.visibleProjects.sort((a, b) => b.lastAccess - a.lastAccess);
    },
    isCreatedByMe(project: project_extended_t) {
      return project.admins[0] === this.userId;
    },
    isSharedWithMe(project: project_extended_t){
      return project.admins.includes(this.userId)|| project.guests.includes(this.userId);
    },
    isOld(project: project_extended_t) {
      // either not used since more than a year or empty and older than an hour
      return project.lastAccess < this.ayear || (project.numberSamples < 1 && project.lastAccess < -3600);
    },
    toggleProjectView() {
      this.listMode = !this.listMode;
      if (this.storage) {
        this.storage.setStorageSync('project_view', this.listMode);
      }
    },
    showProjectSettings(projectName: string) {
      this.projectnameTarget = projectName;
      this.projectSettingsDial = true;
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
  },
});
</script>

<style scoped lang="stylus">
.clickable:hover {
  cursor: pointer;
}

.grid-style-transition {
  transition: transform 0.28s, background-color 0.28s;
}

.category {
  width: fit-content;
  padding: 2px 11px;
  font-size: 18px;
}
</style>
