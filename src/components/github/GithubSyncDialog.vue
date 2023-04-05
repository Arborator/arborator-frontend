<template>
    <q-card-section v-if="selectedRepository == ''">
        <div class="row">
            <div class="col">
                <q-btn-dropdown :disable="repositories.length == 0" class="float-left" size="md" outline color="primary" label="Choose Repository owner" >
                    <q-list :filter-method="searchRepo">
                        <q-item v-for="user in githubOwners" @click="getRepositoriesPerOwner(user.a)" clickable >
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
                <q-input   
                    v-model="search"
                    filled
                    label="Search Repository"
                    type="text"
                    @update:model-value="searchRepo(search)"  
                >
                    <template #append>
                        <q-icon name="search" />
                    </template>
                </q-input>
            </div>
        </div>
        <div v-if="repositoriesPerOwner.length > 0">
            <q-list bordered separator>
                <q-item  v-close-popup class="row" v-for="repo in getListProjects">
                    <q-item-section class="col-8">
                        <q-item-label class="text-left">{{ repo.name }}</q-item-label>
                    </q-item-section>
                    <q-item-section class="col">
                        <q-btn unelevated color="primary" @click="getRepoBranches(repo.name)"> synchronize</q-btn>
                    </q-item-section>
                </q-item>
            </q-list>
            <div class="q-pa-lg flex flex-center">
                <q-pagination
                    v-model="pageIndex" 
                    :min="currentPage" 
                    :max="Math.ceil(repositoriesPerOwner.length / totalItemPerPage)" 
                    :input="true"
                />
            </div>
            <div v-if="noRepositories">
                You need to create your first Github Repository                
            </div>
        </div>
    </q-card-section>
    <q-card-section v-if="selectedRepository != ''">
        <div class="row">
            <div class="col-lg-4 col-sm-4 col-xs-4 col-md-4 q-mb-sm">
                <q-btn flat icon="arrow_back" @click="selectedRepository = ''"/>      
            </div>
        </div>
        <q-list bordered separator>
            <q-item class="row">
                <q-item-section class="col-8">
                    <q-item-label class="text-left">{{selectedRepository}}</q-item-label>
                </q-item-section>
                <q-item-section class="col">
                    <q-btn-dropdown split color="teal" icon="fas fa-code-branch" label="Select branch">
                        <q-list v-for="branch in listBranches">
                            <q-item clickable v-close-popup @click="synchronizeWithGitRepo(selectedRepository, branch)">
                                <q-item-section>
                                    <q-item-label>{{branch}}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </q-item-section>
            </q-item>
        </q-list>
    </q-card-section> 
    
</template>
<script lang="ts">
import api from '../../api/backend-api';
import {mapState} from 'pinia';
import {useUserStore} from 'src/pinia/modules/user';
import {githubRepository_t} from '../../api/backend-types';
import {notifyError, notifyMessage} from 'src/utils/notify';


import {defineComponent} from 'vue';
export default defineComponent({
    name: 'GithubSyncDialog',
    props:['projectName'],
    data() {
        const repositories: githubRepository_t[] =[];
        const repositoriesPerOwner: {}[]= [];
        const listBranches : string[] =[];
        return {
            repositoriesPerOwner,
            repositories,
            selectedRepository:'',
            search:'',
            listBranches,
            branch:'',
            noRepositories: false,
            currentPage: 1,
            pageIndex: 1,
            totalItemPerPage: 10,
        }
    },
    computed: {
        ...mapState(useUserStore, ['username']),
        githubOwners() {
            const githubUsers = [];
            for (const repo of this.repositories){
                const user = {a: repo.owner_name, v: repo.owner_avatar}
                githubUsers.push({a: repo.owner_name, v: repo.owner_avatar})
            }
            return [...new Map(githubUsers.map((user) => [user["a"], user])).values()]; 
        },
        getListProjects() {
            return this.repositoriesPerOwner.slice(
                (this.pageIndex - 1) * this.totalItemPerPage,
                (this.pageIndex - 1) * this.totalItemPerPage + this.totalItemPerPage
            );
        },     
    },
    mounted(){
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
              .catch((error) => {notifyError(error)});
        },
        getRepositoriesPerOwner(owner: string) {
            this.repositoriesPerOwner = [];
            this.repositoriesPerOwner = this.repositories.filter((repo) => repo.owner_name == owner).map((repo) => ({name: repo.name as string}));
        },
        existRepositoryName(repoName: string) {
            return this.repositories.map((repo) => repo.name.split("/")[1]).includes(repoName);
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
              })
              .catch((error) => {
                notifyError(error);
              });
        }, 
        synchronizeWithGitRepo(repoName: string, branch: string) {
            const data = {repositoryName: repoName, branch: branch};
            api
              .synchronizeWithGithubRepo(this.projectName as string, this.username as string,  data)
              .then((response) => {
                notifyMessage({message: `"${this.projectName}" is synchronized with "${repoName}"`})
                this.$emit('created');
              })
              .catch((error) => {
                const errorMessage = error.response.data.message;
                notifyError({error: `${errorMessage}`});
                this.$emit('created');
              });        
        },  
        
    }     
});
</script>
<style>

</style>

