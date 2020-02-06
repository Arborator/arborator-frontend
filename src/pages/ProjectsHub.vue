<template>
  <q-page :class="$q.dark.isActive?'bg-dark':'bg-grey-1'">

    <!-- <div class="q-pa-md row q-gutter-md flex flex-center">
      <object data="../statics/arborator.logo.svg" type="image/svg+xml" width="100" ></object>
    </div> -->

    <div class="q-pa-md row items-start q-gutter-md flex flex-center">
      <q-card flat>
        <q-card-section class="q-pa-md row items-start q-gutter-md">
          <q-toolbar class="text-center">
              <q-btn color="primary" round dense icon="add" @click="creaProjectDial = true">
                <q-tooltip :delay="300" content-class="text-white bg-primary">Create a new project</q-tooltip>
              </q-btn>
              <q-toolbar-title :class="($q.dark.isActive?'':'text-primary') + ' text-bold'">
                Projects
              </q-toolbar-title>
              <q-btn flat round dense :icon="listMode?'view_module':'list'" @click="toggleProjectView()">
                <q-tooltip :delay="300" content-class="text-white bg-primary">Change view</q-tooltip>
              </q-btn>
          </q-toolbar>
          <q-toolbar class="text-center">
            <q-toolbar-title>
              <!-- <span :class="($q.dark.isActive?'':'text-primary') + ' text-bold'">Projects</span> -->
              <q-input filled bottom-slots v-model="search" label="Search Project" type="text" @keyup.enter="searchProject(search)" >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-toolbar-title>
          </q-toolbar>
        </q-card-section>
        <q-card-section v-if="loadingProjects" class="row q-pa-md items-start q-gutter-md" style="width: 90vw; height:60vh;" >
            <q-card style="max-width: 250px; width:250px" v-for="i in skelNumber" :key="i">
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
        <q-card-section v-if="!listMode" style="width: 90vw; height:60vh;">
          <q-virtual-scroll v-if="$q.platform.is.mobile" :items="visibleProjects" style="max-height: 60vh; width:80vw"  :virtual-scroll-slice-size="5" :virtual-scroll-item-size="200">
            <template v-slot="{ item, index }">
              <project-card style="max-width: 80vw" :props="item" :parentDeleteProject="deleteProject" :parentProjectSettings="showProjectSettings" :key="item.id"></project-card>
            </template>
          </q-virtual-scroll>
          <div v-if="!$q.platform.is.mobile" class="q-pa-md row items-start q-gutter-md">
            <project-card style="max-width: 250px" v-for="project in visibleProjects" :props="project" :parentDeleteProject="deleteProject" :parentProjectSettings="showProjectSettings" :key="project.id"></project-card>
          </div>
        </q-card-section>
        <q-card-section v-if="listMode" style="width: 90vw; height:60vh;">
          <q-list style="width:100%" bordered>
            <q-virtual-scroll :items="visibleProjects" style="max-height: 60vh;width:100%;"  :virtual-scroll-slice-size="5" :virtual-scroll-item-size="200">
              <template v-slot="{ item, index }">
                <project-item  :props="item" :parentDeleteProject="deleteProject" :parentProjectSettings="showProjectSettings" :key="item.id"></project-item>
              </template>
            </q-virtual-scroll>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="creaProjectDial" transition-show="fade" transition-hide="fade">
      <crea-project-card :parentGetProjects="getProjects"></crea-project-card>
    </q-dialog>

    <q-dialog v-model="projectSettingsDial" transition-show="slide-up" transition-hide="slide-down" >
      <project-settings-view :projectname="projectnameTarget" style="width:90vw"></project-settings-view>
    </q-dialog>
    
  </q-page>
</template>

<style scoped lang="stylus">
.clickable:hover {
  cursor:pointer;
}

.grid-style-transition
  transition transform .28s, background-color .28s

</style>

<script>
import { openURL } from 'quasar';
import api from '../boot/backend-api';
import Store from '../store/index';
import ProjectCard from '../components/ProjectCard.vue';
import ProjectItem from '../components/ProjectItem.vue';
import CreaProjectCard from '../components/CreaProjectCard.vue';
import ProjectSettingsView from '../components/ProjectSettingsView.vue';

export default {
  components: {
    ProjectCard, ProjectItem, CreaProjectCard, ProjectSettingsView
  },
  name: 'ProjectHub',
  data() {
    return {
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      projects: [],
      visibleProjects: [],
      hover: false,
      search: '',
      listMode: true,
      creaProjectDial: false,
      projectSettingsDial: false,
      projectnameTarget: '',
      loadingProjects: true,
      skelNumber: [...Array(5).keys()]
    }
  },
  mounted(){
    this.listMode = this.$ls.get('project_view', false);
    this.getProjects();
  },
  methods:{
    openURL,
    getProjects(){ this.loadingProjects = true; api.getProjects().then(response => { this.projects = response.data; this.visibleProjects = response.data; this.loadingProjects = false;}).catch(error => { this.$store.dispatch("notifyError", {error: error}); this.loadingProjects = false;}); },
    searchProject(pattern) {
      var filteredProjects =  this.projects.filter(function(project) {
        if(project.projectname.includes(pattern)){
          return project;
        }
      });
      this.visibleProjects = filteredProjects;
    },
    toggleProjectView(){
      this.listMode = !this.listMode;
      this.$ls.set('project_view', this.listMode);
    },
    showProjectSettings(projectName){
      this.projectnameTarget = projectName;
      this.projectSettingsDial = true;
    },
    deleteProject(projectName){
      api.deleteProject(projectName).then(response => {
        this.$q.notify({message:`Project ${projectName} deleted`}); this.getProjects();
      }).catch(error => {this.$store.dispatch("notifyError", {error: error}); });
    }
  }
}
</script>
