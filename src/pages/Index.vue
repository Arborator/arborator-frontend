<template>
  <q-page :class="$q.dark.isActive?'bg-dark':'bg-grey-1'">

    <!-- <div class="q-pa-md row q-gutter-md flex flex-center">
      <object data="../statics/arborator.logo.svg" type="image/svg+xml" width="100" ></object>
    </div> -->

    <div class="q-pa-md row items-start q-gutter-md flex flex-center">
      <q-card flat>
        <q-card-section class="q-pa-md row items-start q-gutter-md">
          <q-toolbar class="text-center">
            <q-toolbar-title>
              <span :class="($q.dark.isActive?'':'text-primary') + ' text-bold'">Projects</span>
              <q-input filled bottom-slots v-model="search" label="Search Project" type="text" @keyup.enter="searchProject(search)" >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </q-toolbar-title>
          </q-toolbar>
          <q-list style="width:100%" bordered>
            <project-card v-for="project in visibleProjects" :props="project" :key="project.id"></project-card>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-card :class="hover ? 'bg-grey-2' : ''" class="clickable col-1 grid-style-transition shadow-7"
      @mouseover="hover = true" 
      @mouseleave="hover = false" 
      @click="openURL('https://arborator.github.io/')"
      :style="hover ? 'transform: scale(0.95);' : ''"
      style="border-radius: 20px 20px 10px 10px">
        <q-card-section>
            <img src="../statics/arborator.quick.svg" width="100em" /> <q-badge align="top" color="positive">No login!</q-badge>
            <q-item-section>
                <q-item-label lines="1"> </q-item-label>
                <q-item-label caption lines="2" :class="$q.dark.isActive?'text-grey':''">
                  CoNLL files graphical editor
                </q-item-label>
            </q-item-section>
        </q-card-section>
      </q-card>
    </q-page-sticky>
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

export default {
  components: {
    ProjectCard
  },
  name: 'PageIndex',
  data() {
    return {
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      projects: [],
      visibleProjects: [],
      hover: false,
      search: ''
    }
  },
  mounted(){
    this.getProjects();
  },
  methods:{
    openURL,
    getProjects(){ api.getProjects().then(response => { this.projects = response.data; this.visibleProjects = response.data;}).catch(error => { console.log(error); }); },
    searchProject(pattern) {
      var filteredProjects =  this.projects.filter(function(project) {
        if(project.projectname.includes(pattern)){
          return project;
        }
      });
      this.visibleProjects = filteredProjects;
    }
  }
}
</script>
