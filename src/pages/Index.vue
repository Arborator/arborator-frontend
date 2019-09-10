<template>
  <q-page >

    <div class="q-pa-md row q-gutter-md flex flex-center">
      <object data="../statics/arborator.svg" type="image/svg+xml" width="300" height="150"></object>
    </div>

    <div class="q-pa-md row items-start q-gutter-md flex flex-center">
      <q-card flat>
        <q-card-section class="q-pa-md row items-start q-gutter-md">
          <q-toolbar class="bg-primary text-white shadow-2 text-center">
            <q-toolbar-title>Projects</q-toolbar-title>
          </q-toolbar>
          <q-list style="width:100%" bordered>
            <project-card v-for="project in projects" :props="project" :key="project.id"></project-card>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-card :class="hover ? 'bg-grey-2' : ''" class="clickable col-1 grid-style-transition shadow-7"
      @mouseover="hover = true" 
      @mouseleave="hover = false" 
      @click="goTo('https://arborator.github.io/')"
      :style="hover ? 'transform: scale(0.95);' : ''"
      style="border-radius: 20px 20px 10px 10px">
        <q-card-section>
            <img src="../statics/q.png"/> <q-badge align="top" color="positive">No login!</q-badge>
            <q-item-section>
                <q-item-label lines="1"> </q-item-label>
                <q-item-label caption lines="2">
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
      hover: false
    }
  },
  mounted(){
    this.getProjects();
  },
  methods:{
    getProjects(){
      // api.getProjects()
      // .then(response => { console.log(response); this.projects = response.data})
      // .catch(error => { console.log(error); });
      this.projects = [ {id:1, description: 'super project', name: 'project', is_private: false}, 
      {id:2, description: 'super project', name: 'project2', is_private: true}, 
      {id:3, description: 'super project', name: 'project3', is_private: false},
      {id:4, description: 'super project', name: 'project4', is_private: true},
      {id:5, description: 'super project', name: 'project5', is_private: false},
      {id:6, description: 'super project', name: 'project6', is_private: false},
      {id:7, description: 'super project', name: 'project7', is_private: false}]
    },
    goTo(url){
      // window.location.href = url;
      window.open(url, '_blank');
    }
  }
}
</script>
