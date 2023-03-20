<template>
    <q-card class="" style="min-width: 50vw;">
        <q-tabs v-model="tab" align="justify" narrow-indicator class="bg-primary text-white shadow-2 q-pa-md">
            <q-tab name="synchronize" label="Synchronize" />
            <q-tab name="create" label="Create" />
        </q-tabs>
        <q-separator/>
        <q-tab-panels v-model="tab" animated class=" text-center">
            <q-tab-panel class="q-gutter-md" name="synchronize">
                <div class="row">
                    <div class="col">
                        <q-btn-dropdown :disable="repositories.length == 0" class="float-left" size="md" outline color="primary" label="Choose Repository owner" >
                            <q-list :filter-method="searchRepo">
                                <q-item v-for="user in githubOwners" @click="getRepositoriesPerOwner(user.a)" v-close-popup clickable >
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
                        <q-item  class="row" v-for="repo in getListProjects">
                            <q-item-section class="col-8">
                                <q-item-label class="text-left">{{ repo.name }}</q-item-label>
                            </q-item-section>
                            <q-item-section class="col">
                                <q-btn unelevated color="primary" @click="synchronizeWithGitRepo(repo.name)"> synchronize</q-btn>
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
                </div>
                <div v-if="noRepositories">
                        You need to create your first Github Repository                
                </div>
            </q-tab-panel>

            <q-tab-panel name="create">
                <div class="text-h6 text-left">Create new repository</div>
                <q-form class="q-gutter-md">
                    <q-input
                        v-model="name"
                        label="Repository Name*"
                        :rules="[
                            (val) => (val && val.length > 0) || 'Please type something',
                            (val) => (!existRepositoryName(val)) || 'Repository name exists already',
                        ]"

                    />
                    <q-input v-model="description" label="Description" />
                    <div class="row">
                        <q-toggle v-model="private" @click="public = false" label="Private" />
                        <q-toggle v-model="public" @click="private = false" label="Public" />
                    </div>
                    <q-btn :disable="name == '' || (!private && !public)" type="submit">Create new repository</q-btn>
                </q-form>
            </q-tab-panel>
        </q-tab-panels>
    </q-card> 
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
        return {
            repositoriesPerOwner,
            repositories,
            tab: 'synchronize',
            search:'',
            current: 1,
            name: '',
            description: '',
            noRepositories: false,
            private: false,
            public: false,
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
            return [...new Map(githubUsers.map((user) => [user["a"], user])).values()] 
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
              .getGithubRepositories(this.projectName as string)
              .then((response) => {
                 this.repositories = response.data;
                 if (this.repositories.length == 0) this.noRepositories = true
              })
              .catch((error) => {console.log(error)})
        },
        getRepositoriesPerOwner(owner: string) {
            this.repositoriesPerOwner = [];
            this.repositoriesPerOwner = this.repositories.filter((repo) => repo.owner_name == owner).map((repo) => ({name: repo.name as string}))
        },
        existRepositoryName(repoName: string) {
            return this.repositories.map((repo) => repo.name.split("/")[1]).includes(repoName)
        },
        searchRepo(repoName: string) {
            this.repositoriesPerOwner = this.repositories.filter((repo) => {
                return repo.name.toLowerCase().includes(repoName.toLowerCase());
            });
        }, 
        synchronizeWithGitRepo(repoName : string) {
            const data = {repositoryName: repoName};
    
            api
              .synchronizeWithGithubRepo(this.$route.params.projectname as string, this.username as string,  data)
              .then((response) => {
                notifyMessage({message: `"${this.$route.params.projectname}" is synchronized with "${repoName}"`})
              })
              .catch((error) => {
                notifyError({error})}
              );
        },


       
    }
     

    
    
});
</script>
<style>

</style>

