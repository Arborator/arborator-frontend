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
        <div class="row q-pa-md q-gutter-md" style="justify-content: right">
          <q-btn no-caps outline label="Extract projects languages" color="primary" @click="exportLanguages()" />
        </div>
        <div class="row q-gutter-x-md">
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
          <q-card flat bordered class="col">
            <q-card-section class="row">
              <div class="col text-h6">
                Old and empty projects
              </div>
              <div style="justify-content: right;" >
                <q-btn no-caps unelevated color="primary" label="Remove all" @click="deleteEmptyAndOldProjects" />
              </div>
            </q-card-section>
            <q-card-section>
              <q-virtual-scroll
                style="max-height: 50vh;"
                :items="oldProjects"
                separator
                v-slot="{ item, index }"
              >
                <q-item :key="index">
                  <q-item-section>
                    <q-item-label>{{ item.name }}</q-item-label>
                    <q-item-label caption>{{ item.samplesNumber }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ timeAgo(item.lastAccess) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-virtual-scroll>
            </q-card-section>
            <q-card-section v-if="oldProjects.length === 0">
             No old projects
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import api from 'src/api/backend-api';
import { timeAgo } from 'src/utils/timeAgoUtils';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
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
    return {
      users,
      dbProjects,
      grewProjects,
      oldProjects,
      usersFiltered,
      userSearch: '',
    }
  },
  computed: {
    ...mapWritableState(useUserStore, ['email', 'first_name', 'family_name']),
    ...mapState(useUserStore, ['avatarKey', 'picture_url', 'super_admin', 'username']),
  },
  mounted() {
    this.getUsers();
    this.mismatchProjects();
    this.getEmptyAndOldProject();
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
    getEmptyAndOldProject() {
      const year = -3600 * 24 *365;
      api
        .getProjects()
        .then((response) => {
          for (const project of response.data) {
            if (project.lastAccess < year || (project.numberSamples < 1 && project.lastAccess < -3600) || project.admins.length === 0) {
              this.oldProjects.push({
                name: project.projectName,
                lastAccess: project.lastAccess,
                samplesNumber: project.numberSamples,
              });
            }
          }
        })
        .catch((error) => {
          notifyError({ error: `Error happened while loading empty and old project ${error}` });
        });
    },
    exportLanguages() {
      let languageTsv = '';
      api
        .getProjectsLanguages()
        .then((response) => {
          for (const language of response.data.sort()) {
            languageTsv += language + '\n';
          }
          const url = window.URL.createObjectURL(new Blob([languageTsv], { type: 'text/tab-separated-values' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `languages_list.tsv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          notifyError({error: `Error while exporting languages list ${error}`});
        });
    },
    deleteEmptyAndOldProjects() {
      for (const project of this.oldProjects) {
        api
        .deleteProject(project.name)
        .then(() => {
          notifyMessage({ message: 'Old and empty projects are deleted' });
          this.oldProjects = [];
        })
        .catch((error) => {
          notifyError({ error: `Error happened while removing old projects ${error}` });
        });
      }
    },
    deleteMismatchProjects() {

    }


  },
});
</script>

