<template>
  <q-page>
    <q-card flat>
      <q-card-section class="row q-gutter-x-md">
        <q-card bordered flat class="col">
          <q-banner rounded :class="$q.dark.isActive ? '' : 'bg-grey-3'">
            <template #avatar>
              <q-avatar :key="avatarKey" color="default" text-color="white" size="100px">
                <img :src="picture_url" alt="avatar" />
              </q-avatar>
            </template>
            <div class="row">
              <div :class="'col text-center text-weight-bold text-h4 ' + ($q.dark.isActive ? '' : 'text-blue-grey-10')">
                {{ first_name }} {{ family_name }}
              </div>
            </div>
            <div class="row">
              <div :class="'col text-center '+($q.dark.isActive ? '' : 'text-blue-grey-8')">@{{ username }}</div>
            </div>
            <div v-show="super_admin" class="row">
              <div :class="'col text-center '+ ($q.dark.isActive ? '' : 'text-blue-grey-8')">Super Admin</div>
            </div>
          </q-banner>
          <q-card-section>
            <q-form @submit="onSubmitModifications">
              <div class="text-h6 text-blue-grey-8">{{ $t('settingsPage.title') }}</div>
              <div class="q-gutter-lg q-pa-md">
                <q-input outlined v-model="email" type="email" label="Email" />
                <q-input outlined v-model="first_name" type="text" :label="$t('settingsPage.firstName')" />
                <q-input outlined v-model="family_name" type="text" :label="$t('settingsPage.familyName')" />
              </div>
              <q-btn type="submit" icon="save" color="primary">
                {{ $t('settingsPage.saveModifications') }}
              </q-btn>
            </q-form>
          </q-card-section>
        </q-card>
        <q-card v-if="super_admin" bordered flat class="col">
          <q-card-section class="row q-gutter-x-md">
            <q-input class="col-8" outlined dense v-model="userSearch" label="search a user" @update:model-value="searchUser(userSearch)">
              <template #append>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn no-caps class="col" color="primary" label="Export user Emails" @click="exportUserEmails()" />
          </q-card-section>
          <q-card-section>
            <q-virtual-scroll
              style="max-height: 50vh;"
              :items="usersFiltered"
              separator
              v-slot="{ item, index }"
            >
              <q-item :key="index">
                <q-item-section avatar>
                  <q-avatar size="1.2rem">
                    <img :src="item.avatar" alt="avatar" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.username }}</q-item-label>
                  <q-item-label caption>{{ item.email }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-virtual-scroll>
            <q-item v-if="usersFiltered.length == 0">
              No search results
            </q-item>
          </q-card-section>
        </q-card>
      </q-card-section>
      <q-card-section v-if="super_admin">
        <q-table
          flat
          bordered
          :rows="filteredListProject"
          :columns="table.fields"
          :filter="table.filter"
          :filter-method="searchProject"
          row-key="projectName"
          @row-click="onRowClick"
          hide-no-data
          selection="single"
          v-model:selected="table.selected"
        >
          <template #top>
            <div class="row q-gutter-md">
              <q-btn no-caps color="primary" label="Remove project" @click="deleteProject()" />
              <q-btn no-caps outline label="Extract projects languages" color="primary" @click="exportLanguages()" />
              <q-input outlined dense v-model="table.filter" label="Search project" text-color="blue-grey-8">
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-select dense outlined v-model="projectsType" :options="['All', 'Old']" label="Select project type" />
            </div>
          </template>
          <template #body-cell-visibility="props">
            <q-td key="visibilty" :props="props">
              <q-chip outline v-if="props.row.visibility === 0" label="private" color="red-6" />
              <q-chip outline v-if="props.row.visibility === 1" label="visible" color="yellow-9" />
              <q-chip outline v-if="props.row.visibility === 2" label="public" color="light-green-8" />
            </q-td>
          </template>
          <template #body-cell-lastAccess="props">
            <q-td key="lastAccess" :props="props">
              {{ timeAgo(props.row.lastAccess) }}
            </q-td>
          </template>
          <template #body-cell-lastWriteAccess="props">
            <q-td key="lastWriteAccess" :props="props">
              {{ timeAgo(props.row.lastAccess) }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-card-section class="row q-gutter-x-md" v-if="super_admin">
        <q-card flat bordered class="col">
          <q-card-section class="row">
            <div class="col text-h6">
              DB projects
            </div>
            <div style="justify-content: right;" >
              <q-btn no-caps unelevated color="primary" label="Remove all" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-virtual-scroll
              style="max-height: 50vh;"
              :items="dbProjects"
              separator
              v-slot="{ item, index }"
            >
              <q-item :key="index">
                <q-item-section>
                  <q-item-label>{{ item }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-virtual-scroll>
          </q-card-section>
          <q-card-section v-if="dbProjects.length === 0">
            No DB projcts mismatch with grew server
          </q-card-section>
        </q-card>
        <q-card flat bordered class="col">
          <q-card-section class="row">
            <div class="col text-h6">
              Grew projects
            </div>
            <div style="justify-content: right;" >
              <q-btn no-caps unelevated color="primary" label="Remove all" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-virtual-scroll
              style="max-height: 50vh;"
              :items="grewProjects"
              separator
              v-slot="{ item, index }"
            >
              <q-item :key="index">
                <q-item-section>
                  <q-item-label>{{ item }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-virtual-scroll>
          </q-card-section>
          <q-card-section v-if="grewProjects.length === 0">
            No grew projcts mismatch with ArboratorGrew
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import api from 'src/api/backend-api';
import { timeAgo } from 'src/utils/timeAgoUtils';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { table_t } from 'src/types/main_types';
import { project_extended_t } from 'src/api/backend-types';
import { notifyError, notifyMessage } from 'src/utils/notify';
import { defineComponent } from 'vue';

interface userOption_t {
  username: string;
  email: string;
  avatar: string;
}

export default defineComponent({
  name: 'Settings',
  data() {
    const users: userOption_t[] = [];
    const usersFiltered: userOption_t[] = [];
    const dbProjects: string[] = [];
    const grewProjects: string[] = [];
    const oldProjects: any[] = [];
    const projects: any[] = [];
    const languages: { [language: string]: string[] } = {}
    const table: table_t<any> = {
      fields: [
        {
          name: 'projectName',
          label: 'project Name',
          sortable: true,
          field: 'projectName',
        },
        {
          name: 'visibility',
          label: 'visibility',
          sortable: true,
          field: 'visibility',
        },
        {
          name: 'language',
          label: 'Language',
          sortable: true,
          field: 'language',
        },
        {
          name: 'owner',
          label: 'owner',
          sortable: true,
          field: 'owner',
        },
        {
          name: 'contact',
          label: 'contact',
          sortable: true,
          field: 'contact',
        },
        {
          name: 'samplesNumber',
          label: 'samples Number',
          sortable: true,
          field: 'samplesNumber',
        },
        {
          name: 'lastAccess',
          label: 'Last Access',
          sortable: true,
          field: 'lastAccess',
        },
        {
          name: 'lastWriteAccess',
          label: 'Last write access',
          sortable: true,
          field: 'lastWriteAccess',
        },
        {
          name: 'syncRepo',
          label: 'Syncronized with',
          sortable: true,
          field: 'syncRepo',
        },
        {
          name: 'config',
          label: 'Annotation config',
          sortable: true,
          field: 'config',
        },
        {
          name: 'blindAnnotationMode',
          label: 'Blind annotation mode',
          sortable: true,
          field: 'blindAnnotationMode',
        },
      ],
      selected: [],
      visibleColumns: ['projectName', 'langue', 'owner', 'contact', 'samplesNumber', 'lastAccess', 'lastWriteAccess', 'syncRepo', 'config'],
      filter: '',
      loading: false,
      pagination: {
        sortBy: 'projectName',
        descending: true,
        page: 1,
        rowsPerPage: 10,
      },
      loadingDelete: false,
      exporting: false,
    };
    return {
      users,
      dbProjects,
      grewProjects,
      oldProjects,
      usersFiltered,
      userSearch: '',
      table,
      projects,
      languages,
      projectsType: 'All',
    }
  },
  computed: {
    ...mapWritableState(useUserStore, ['email', 'first_name', 'family_name']),
    ...mapState(useUserStore, ['avatarKey', 'picture_url', 'super_admin', 'username']),
    filteredListProject(): any[] {
      if (this.projectsType === 'Old') {
        return this.projects.filter((project: any) => project.isOld)
      }
      else {
        return this.projects;
      }
    }
  },
  mounted() {
    this.getUsers();
    this.mismatchProjects();
    this.getProjects();
  },
  methods: {
    ...mapActions(useUserStore, ['updateUserInformation']),
    timeAgo(secsAgo: number) {
      return timeAgo(secsAgo);
    },
    onSubmitModifications() {
      const data = {
        email: this.email as string,
        first_name: (this.first_name as string) || '',
        family_name: (this.family_name as string) || '',
      };
      this.updateUserInformation(data);
    },
    getUsers() {
      api
        .getUsers()
        .then((response) => {
          for (const user of response.data) {
            this.users.push({
              username: user.username,
              email: user.email,
              avatar: user.picture_url
            });
            this.usersFiltered = this.users;
          }
        })
        .catch((error) => {
          notifyError({ error: `Error happened while getting list of users ${error}` });
        });
    },
    searchUser(userSearch: string) {
      this.usersFiltered = this.users.filter((user) => {
        return user.username.toLowerCase().includes(userSearch.toLowerCase());
      });
    },
    exportUserEmails() {
      let emailTsv = 'username\temail\n';
      for (const user of this.users) {
        if (user.email !== null && user.email !== '') {
          emailTsv += `${user.username}\t${user.email}\n`;
        }
      }
      const url = window.URL.createObjectURL(new Blob([emailTsv], { type: 'text/tab-separated-values' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_emails.tsv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    exportLanguages() {
      let languageTsv = 'language\tprojects\n';
      for (const [language, projects] of Object.entries(this.languages)) {
        languageTsv += language + '\t' + projects.join(',') + '\n';
      }
      const url = window.URL.createObjectURL(new Blob([languageTsv], { type: 'text/tab-separated-values' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `languages_list.tsv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
        
    },
    isOld(project: project_extended_t) {
      const year = -3600 * 24 * 365;
      return project.lastAccess < year || (project.numberSamples < 1 && project.lastAccess < -3600) || project.admins.length === 0;
    },
    deleteProject() {
      api
      .deleteProject(this.table.selected[0].projectName)
      .then(() => {
        notifyMessage({ message: `project ${this.table.selected[0].projectName} is deleted` });
        this.getProjects();
      })
      .catch((error) => {
        notifyError({ error: `Error happened while removing old projects ${error}` });
      });
    },
    getProjects() {
      api
        .getProjects()
        .then((response) => {
          for (const project of response.data) {
            this.projects.push({
              projectName: project.projectName,
              visibility: project.visibility,
              language: project.language ? project.language : 'Not specified',
              owner: project.owner,
              contact: project.contactOwner ? project.contactOwner : 'Not specified',
              samplesNumber: project.numberSamples,
              lastAccess: project.lastAccess,
              lastWriteAccess: project.lastWriteAccess,
              syncRepo: project.syncGithub ? project.syncGithub: 'Not synchronized',
              config: project.config ? project.config: 'Not specified',
              isOld: this.isOld(project),
              blindAnnotationMode: project.blindAnnotationMode,
            });
            if (Object.keys(this.languages).includes(project.language)) {
              this.languages[project.language].push(project.projectName);
            } 
            else {
              this.languages[project.language]  = []
              this.languages[project.language].push(project.projectName);
            }
          }
        })
        .catch((error) => {
          notifyError({ error: `Error while loading projects list ${error}`});
        });
    },
    searchProject(rows: any[], terms: any) {
      return rows.filter((row) => row.projectName.indexOf(terms) !== -1);
    },
    onRowClick(evt: Event, row: any) {
      this.$router.push({
        name: 'project',
        params: {
          projectname: row.projectName,
        },
      });
    },
    mismatchProjects() {
      api
        .getMismatchProjects()
        .then((response) => {
          this.dbProjects = response.data.db_projects;
          this.grewProjects = response.data.grew_projects;
        })
        .catch((error) => {
          notifyError({ error: `Error happened while loading mismatch project ${error}` });
        });
    },
  },
});
</script>

