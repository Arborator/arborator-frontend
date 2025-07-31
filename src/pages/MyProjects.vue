<template>
  <q-page class="custom-frame1">
    <div class="q-pa-md">
      <q-card flat>
        <q-card-section class="text-h4"> Welcome, {{ username }} </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="text-h6">
            My statistics
          </div>
          <div class="row justify-between q-gutter-md">
            <q-card flat bordered class="col">
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="folder" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6"> {{ myProjects.length }}</q-item-label>
                  <q-item-label caption>
                    Projects
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-card>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row q-gutter-md" style="justify-content: right;">
            <q-btn
              no-caps
              color="primary"
              :label="$t('projectHub.newProject')"
              icon="add"
              size="md"
              @click="creaProjectDial = true"
            >
              <q-tooltip :delay="300" class-content="text-white bg-primary">
                {{ $t('projectHub.tooltipCreaProject[1]') }}
              </q-tooltip>
            </q-btn>
            <q-input  dense outlined v-model="search" label="search project" @update:model-value="searchProject(search)">
              <template #append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="q-pa-md row q-gutter-md">
            <ProjectCard
              v-for="project in paginatedProjects"
              :key="project.id"
              style="max-width: 300px"
              :project="project"
              :parent-delete-project="deleteProject"
            ></ProjectCard>
          </div>
          <div class="q-pa-md flex flex-center">
            <q-pagination v-model="pageIndex" :min="currentPage" :max="Math.ceil(filteredProjects.length / totalItemPerWindow)" :input="true" />
          </div>
        </q-card-section>
        <q-separator />
        <CreaProjectCard v-if="creaProjectDial" :parent-get-projects="getUserProjects" @created="creaProjectDial = false"></CreaProjectCard>
      </q-card>
    </div>
  </q-page>
</template>
<script lang="ts">
import { mapState, mapActions } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { useProjectStore } from 'src/pinia/modules/project';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { project_extended_t } from 'src/api/backend-types';
import { defineComponent } from 'vue';

import api from 'src/api/backend-api';
import ProjectCard from 'src/components/project/ProjectCard.vue';
import CreaProjectCard from 'src/components/project/CreaProjectCard.vue';


export default defineComponent({
  name: 'MyProjects',
  components: {
    ProjectCard,
    CreaProjectCard,
  },
  data() {
    const myProjects: project_extended_t[] = [];
    const filteredProjects: project_extended_t[] = [];
    return {
      myProjects,
      filteredProjects,
      search: '',
      totalItemPerWindow: 0,
      pageIndex: 1,
      currentPage: 1,
      creaProjectDial: false,
    }
  },
  computed: {
    ...mapState(useUserStore, ['username']),
    paginatedProjects(): project_extended_t[] {
      return this.filteredProjects.slice(
        (this.pageIndex - 1) * this.totalItemPerWindow,
        (this.pageIndex - 1) * this.totalItemPerWindow + this.totalItemPerWindow
      );
    },
  },
  mounted() {
    this.getUserProjects();
    this.totalItemPerWindow = Math.trunc(window.innerWidth/ 330);
    window.addEventListener('resize', () => {
      this.totalItemPerWindow = Math.trunc(window.innerWidth/ 330);
    });
  },
  methods: {
    ...mapActions(useProjectStore, ['sortProjects']),
    getUserProjects() {
      api
        .getUserProjects()
        .then((response) => {
          this.myProjects = response.data;
          this.filteredProjects = this.myProjects; 
          this.sortProjects(this.filteredProjects);
        })
        .catch((error) => {
          notifyError({ error, caller: 'getUserProjects' });
        });
    },
    searchProject(term: string) {
      this.filteredProjects = this.myProjects.filter((project) => {
        return project.projectName.toLowerCase().includes(term.toLowerCase());
      });
    },
    deleteProject(projectName: string) {
      api
        .deleteProject(projectName)
        .then(() => {
          notifyMessage({ message: `Project ${projectName} deleted` });
          this.getUserProjects();
        })
        .catch((error) => {
          notifyError({ error, caller: 'deleteProject' });
        });
    }
  }

});
</script>
