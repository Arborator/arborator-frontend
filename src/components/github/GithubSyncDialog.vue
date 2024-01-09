<template>
  <q-card-section v-if="selectedRepository == ''">
    <div class="row q-mb-xs">
      <div class="col">
        <q-btn-dropdown
          :disable="repositories.length == 0"
          class="float-left"
          size="md"
          outline
          color="primary"
          :label="$t('github.chooseRepoOwner')"
        >
          <q-list :filter-method="searchRepo">
            <q-item v-for="user in githubOwners" @click="getRepositoriesPerOwner(user.a)" clickable v-close-popup>
              <q-item-section avatar>
                <q-avatar size="1.2rem">
                  <img :src="user.v" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ user.a }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <div class="col">
        <q-input v-model="search" filled :label="$t('github.search')" type="text" @update:model-value="searchRepo(search)">
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
    <div v-if="repositoriesPerOwner.length > 0">
      <q-list bordered separator>
        <q-item class="row" v-for="repo in getListProjects">
          <q-item-section class="col-8">
            <q-item-label class="text-left">{{ repo.name }}</q-item-label>
          </q-item-section>
          <q-item-section class="col">
            <q-btn unelevated color="primary" @click="getRepoBranches(repo.name)" :label="$t('github.select')" />
          </q-item-section>
        </q-item>
      </q-list>
      <div class="q-pa-lg flex flex-center">
        <q-pagination v-model="pageIndex" :min="currentPage" :max="Math.ceil(repositoriesPerOwner.length / totalItemPerPage)" :input="true" />
      </div>
      <div v-if="noRepositories">
        {{ $t('github.noGithubRepos') }}
      </div>
    </div>
  </q-card-section>
  <q-card-section v-if="selectedRepository != ''" class="q-gutter-md">
    <div class="row">
      <div class="col-lg-4 col-sm-4 col-xs-4 col-md-4 q-mb-sm">
        <q-btn flat icon="arrow_back" @click="selectedRepository = ''" />
      </div>
    </div>
    <q-list bordered separator>
      <q-item class="row">
        <q-item-section class="col-8">
          <q-item-label class="text-left">{{ selectedRepository }}</q-item-label>
        </q-item-section>
        <q-item-section class="col">
          <q-select filled v-model="branch" :options="listBranches" :label="$t('github.selectBranch')">
            <q-tooltip>{{ $t('github.selectBranch') }}</q-tooltip>
          </q-select>
        </q-item-section>
      </q-item>
    </q-list>
    <q-input outlined dense v-model="customUsername" :label="$t('uploadSample.customUsername')" />
    <div :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'" class="q-pa-sm">
      <q-radio dense size="md" v-model="branchSyn" val="arboratorgrew" />
      {{ $t('github.arboratorgrewBranch[0]') }}
      <span style="background-color: #7f90c0"><code>arboratorgrew</code></span>
      {{ $t('github.arboratorgrewBranch[1]') }}
    </div>
    <div :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'" class="q-pa-sm">
      <q-radio dense size="md" v-model="branchSyn" val="default" /> {{ $t('github.defaultBranch') }}
    </div>
    <div class="row q-gutter-md justify-center">
      <q-btn :loading="loading" :disable="branch == ''" color="primary" @click="synchronizeWithGitRepo(selectedRepository, branch, branchSyn)"
        >{{ $t('github.synchronize') }}
        <template v-slot:loading>
          <q-spinner color="grey-11" size="xs" />
        </template>
      </q-btn>
    </div>
  </q-card-section>
</template>
<script lang="ts">
import api from '../../api/backend-api';
import { mapState } from 'pinia';
import { useUserStore } from 'src/pinia/modules/user';
import { githubRepository_t } from '../../api/backend-types';
import { notifyError, notifyMessage } from 'src/utils/notify';

import { defineComponent, PropType } from 'vue';
export default defineComponent({
  name: 'GithubSyncDialog',
  emits: ['created'],
  props: {
    projectName: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    const repositories: githubRepository_t[] = [];
    const repositoriesPerOwner: {}[] = [];
    const listBranches: string[] = [];
    return {
      repositoriesPerOwner,
      repositories,
      selectedRepository: '',
      search: '',
      listBranches,
      branch: '',
      branchSyn: 'arboratorgrew',
      noRepositories: false,
      currentPage: 1,
      pageIndex: 1,
      totalItemPerPage: 8,
      customUsername: '',
      loading: false,
    };
  },
  computed: {
    ...mapState(useUserStore, ['username']),
    githubOwners() {
      const githubUsers = [];
      for (const repo of this.repositories) {
        githubUsers.push({ a: repo.owner_name, v: repo.owner_avatar });
      }
      return [...new Map(githubUsers.map((user) => [user['a'], user])).values()];
    },
    getListProjects() {
      return this.repositoriesPerOwner.slice(
        (this.pageIndex - 1) * this.totalItemPerPage,
        (this.pageIndex - 1) * this.totalItemPerPage + this.totalItemPerPage
      );
    },
  },
  mounted() {
    this.getGithubRepositories();
  },
  methods: {
    getGithubRepositories() {
      api
        .getGithubRepositories(this.projectName as string, this.username)
        .then((response) => {
          this.repositories = response.data;
          if (this.repositories.length == 0) this.noRepositories = true;
        })
        .catch((error) => {
          notifyError(error);
        });
    },
    getRepositoriesPerOwner(owner: string) {
      this.repositoriesPerOwner = [];
      this.repositoriesPerOwner = this.repositories.filter((repo) => repo.owner_name == owner).map((repo) => ({ name: repo.name as string }));
    },
    existRepositoryName(repoName: string) {
      return this.repositories.map((repo) => repo.name.split('/')[1]).includes(repoName);
    },
    searchRepo(repoName: string) {
      this.repositoriesPerOwner = this.repositories.filter((repo) => {
        return repo.name.toLowerCase().includes(repoName.toLowerCase());
      });
    },
    getRepoBranches(repoName: string) {
      this.selectedRepository = repoName;
      api
        .getGithubRepoBranches(this.projectName, this.username, this.selectedRepository)
        .then((response) => {
          this.listBranches = response.data;
          this.branch = this.listBranches[0];
        })
        .catch((error) => {
          notifyError(error);
        });
    },
    async synchronizeWithGitRepo(repoName: string, branch: string, branchSyn: string) {
      if (branchSyn == 'default') branchSyn = branch;
      const data = {
        repositoryName: repoName,
        branchImport: branch,
        branchSyn: branchSyn,
        username: this.customUsername !== '' ? this.customUsername : this.username,
      };
      this.loading = true;
      var interval = setTimeout(() => {
        this.$q.notify({
          message: this.$t('github.syncWarningMessage'),
          color: 'warning',
          position: 'top',
          timeout: 5000,
        });
      }, 10000);
      api
        .synchronizeWithGithubRepo(this.projectName as string, data)
        .then(() => {
          notifyMessage({ message: `"${this.projectName}" ${this.$t('github.synchronizeMessage')} "${repoName}"` });
          this.loading = false;
          this.$emit('created');
          clearTimeout(interval);
        })
        .catch((error) => {
          const errorMessage = error.response.data.message;
          if (error.response.status == 413) {
            notifyError({ error: `You can't synchronize with "${repoName}" because ${errorMessage}` });
          } else {
            notifyError({ error: `${errorMessage}` });
          }
          this.loading = false;
          this.$emit('created');
          clearTimeout(interval);
        });
    },
  },
});
</script>
<style></style>
