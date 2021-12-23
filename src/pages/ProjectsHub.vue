<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-1'">
    <div class="q-pa-md row items-start q-gutter-md flex flex-center">
      <q-card flat>
        <q-card-section class="q-pa-md row items-start q-gutter-md">
          <q-toolbar class="text-center">
            <q-btn :disable="!isLoggedIn" id="createproject" color="primary" round dense icon="add" @click="creaProjectDial = true">
              <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectHub.tooltipCreaProject') }}</q-tooltip>
            </q-btn>
            <q-toolbar-title :class="($q.dark.isActive ? '' : 'text-primary') + ' text-bold'">
              {{ $t('projectHub.title') }}
            </q-toolbar-title>
            <q-btn flat round dense :icon="listMode ? 'view_module' : 'list'" @click="toggleProjectView()">
              <q-tooltip :delay="300" content-class="text-white bg-primary">{{ $t('projectHub.tooltipChangeView') }}</q-tooltip>
            </q-btn>
          </q-toolbar>
          <q-toolbar class="text-center">
            <q-toolbar-title>
              <!-- <span :class="($q.dark.isActive?'':'text-primary') + ' text-bold'">Projects</span> -->
              <q-input
                filled
                bottom-slots
                v-model="search"
                :label="$t('projectHub.emptySearch')"
                type="text"
                @input="searchProject(search)"
                @keyup.enter="searchProject(search)"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-toolbar-title>
          </q-toolbar>
        </q-card-section>
        <q-card-section v-if="initLoading" class="row q-pa-md items-start q-gutter-md" style="width: 90vw; height: 60vh">
          <q-card style="max-width: 250px; width: 250px" v-for="i in skelNumber" :key="i">
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
            <template v-slot="{ item }">
              <ProjectCard
                style="max-width: 80vw"
                :props="item"
                :parentDeleteProject="deleteProject"
                :parentProjectSettings="showProjectSettings"
                :key="item.id"
              ></ProjectCard>
            </template>
          </q-virtual-scroll>
          <!-- if not mobile: -->
          <!-- four groups: my projects, my old projects, other projects, other old projects: -->
          <div v-if="isLoggedIn && !$q.platform.is.mobile" class="q-pa-md row items-start q-gutter-md">
            <div class="text-h6 col-12" v-if="myProjects.length">
              <q-chip color="primary" class="category" text-color="white"> {{ $t('projectHub.myProjects') }} </q-chip>
            </div>
            <ProjectCard
              style="max-width: 270px"
              v-for="project in myProjects"
              :props="project"
              :parentDeleteProject="deleteProject"
              :parentProjectSettings="showProjectSettings"
              :key="project.id"
            ></ProjectCard>
            <div class="text-h6 col-12" v-if="myOldProjects.length">
              <q-chip color="primary" class="category" text-color="white"> {{ $t('projectHub.myOldProjects') }} </q-chip><br />
              <q-chip outline color="negative" class="bg-white text-negative">{{ $t('projectHub.myOldProjectInfo') }}</q-chip>
            </div>
            <ProjectCard
              style="max-width: 270px"
              v-for="project in myOldProjects"
              :props="project"
              :parentDeleteProject="deleteProject"
              :parentProjectSettings="showProjectSettings"
              :key="project.id"
            ></ProjectCard>
          </div>
          <div v-if="!$q.platform.is.mobile" class="q-pa-md row items-start q-gutter-md">
            <div class="text-h6 col-12" v-if="isLoggedIn && otherProjects.length">
              <q-chip color="primary" class="category" text-color="white"> {{ $t('projectHub.otherProjects') }} </q-chip>
            </div>
            <ProjectCard
              style="max-width: 250px"
              v-for="project in otherProjects"
              :props="project"
              :parentDeleteProject="deleteProject"
              :parentProjectSettings="showProjectSettings"
              :key="project.id"
            ></ProjectCard>
            <div class="text-h6 col-12" v-if="otherOldProjects.length">
              <q-chip color="primary" class="category" text-color="white">{{ $t('projectHub.otherOldProjects') }}</q-chip
              ><br />
              <q-chip outline color="negative" class="bg-white text-negative">{{ $t('projectHub.otherOldProjectInfo') }}</q-chip>
            </div>
            <ProjectCard
              style="max-width: 250px"
              v-for="project in otherOldProjects"
              :props="project"
              :parentDeleteProject="deleteProject"
              :parentProjectSettings="showProjectSettings"
              :key="project.id"
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
              <template v-slot="{ item }">
                <ProjectItem
                  :props="item"
                  :parentDeleteProject="deleteProject"
                  :parentProjectSettings="showProjectSettings"
                  :key="item.id"
                ></ProjectItem>
              </template>
            </q-virtual-scroll>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="creaProjectDial" transition-show="fade" transition-hide="fade">
      <CreaProjectCard :parentGetProjects="getProjects"></CreaProjectCard>
    </q-dialog>

    <q-dialog v-model="projectSettingsDial" transition-show="slide-up" transition-hide="slide-down">
      <ProjectSettingsView :projectname="projectnameTarget" style="width: 90vw"></ProjectSettingsView>
    </q-dialog>

    <q-dialog v-model="confirmActionDial">
      <confirm-action :parentAction="confirmActionCallback" :arg1="confirmActionArg1"></confirm-action>
    </q-dialog>
  </q-page>
</template>

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

<script>
import { openURL } from 'quasar';
import { useStorage } from 'vue3-storage';
import api from '../boot/backend-api';
import Store from '../store/index';
import ProjectCard from '../components/ProjectCard.vue';
import ProjectItem from '../components/ProjectItem.vue';
import CreaProjectCard from '../components/CreaProjectCard.vue';
import ProjectSettingsView from '../components/ProjectSettingsView.vue';
import ConfirmAction from '../components/ConfirmAction';

export default {
  components: {
    ProjectCard,
    ProjectItem,
    CreaProjectCard,
    ProjectSettingsView,
    ConfirmAction,
  },
  name: 'ProjectHub',
  data() {
    return {
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      projects: [],
      visibleProjects: [],
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
      storage: null,
      ayear: -3600 * 24 * 365,
      userId: '',
    };
  },
  mounted() {
    document.title = `ArboratorGrew: ${this.$t('projectHub.title')}`;
    this.storage = useStorage();
    this.initLoading = true;
    this.userId = this.$store.getters['user/getUserInfos'].id;
    // this.listMode = this.$storage.getStorageSync("project_view", false);
    this.listMode = this.storage.getStorageSync('project_view', false);
    this.getProjects();
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters['user/isLoggedIn'];
    },
    myProjects() {
      return this.visibleProjects.filter((project) => {
        return this.isCreatedByMe(project) && !this.isOld(project);
      });
    },
    myOldProjects() {
      return this.visibleProjects.filter((project) => {
        return this.isCreatedByMe(project) && this.isOld(project);
      });
    },
    otherProjects() {
      return this.visibleProjects.filter((project) => {
        return !this.isCreatedByMe(project) && !this.isOld(project);
      });
    },
    otherOldProjects() {
      return this.visibleProjects.filter((project) => {
        return !this.isCreatedByMe(project) && this.isOld(project);
      });
    },
    avatar() {
      return this.$store.getters['user/getUserInfos'].picture_url;
    },
  },
  methods: {
    openURL,
    getProjects() {
      this.loadingProjects = true;
      api
        .getProjects()
        .then((response) => {
          // console.log('here', response.data);
          this.projects = response.data;
          this.visibleProjects = response.data;
          this.sortProjects();
          // this.projectDifference = response.data.difference;
          this.loadingProjects = false;
          this.initLoading = false;
          // }
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
          this.loadingProjects = false;
        });
    },
    searchProject(pattern) {
      const filteredProjects = this.projects.filter((project) => {
        return project.project_name.toLowerCase().includes(pattern.toLowerCase()) === true;
      });
      this.visibleProjects = filteredProjects;
    },
    // oldsortProjects() {
    //   if (!this.isLoggedIn) return;
    //   this.visibleProjects.sort((a, b) => {
    //     const myProjectA = this.isCreatedByMe(a);
    //     const myProjectB = this.isCreatedByMe(b);
    //     if (myProjectA && myProjectB) return 0;
    //     if (myProjectA) return -1;
    //     return 1;
    //   });
    // },
    sortProjects() {
      // if (!this.isLoggedIn) return;
      this.visibleProjects.sort((a, b) => b.last_access - a.last_access);
    },
    isCreatedByMe(project) {
      return project.admins[0] === this.userId;
    },
    isOld(project) {
      // either not used since more than a year or empty and older than an hour
      return project.last_access < this.ayear || (project.number_samples < 1 && project.last_access < 3600);
    },
    toggleProjectView() {
      this.listMode = !this.listMode;
      this.storage.setStorageSync('project_view', this.listMode);
    },
    showProjectSettings(projectName) {
      this.projectnameTarget = projectName;
      this.projectSettingsDial = true;
    },
    deleteProject(projectName) {
      api
        .deleteProject(projectName)
        .then((response) => {
          this.$q.notify({ message: `Project ${projectName} deleted` });
          this.getProjects();
        })
        .catch((error) => {
          this.$store.dispatch('notifyError', { error });
        });
    },
    triggerConfirm(method, arg) {
      this.confirmActionDial = true;
      this.confirmActionCallback = method;
      this.confirmActionArg1 = arg;
    },
  },
};
</script>
