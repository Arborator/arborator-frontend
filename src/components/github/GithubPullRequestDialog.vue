<template>
    <q-card style="min-width: 50vw;">
        <q-bar class="bg-primary text-white">
            <q-space />
            <q-btn v-close-popup flat dense icon="close" />
        </q-bar>
        <q-card-section>
            <div class="text-h6 text-left">Pull Request</div>
        </q-card-section>
        <q-separator />
        <q-card-section v-if="listBranches.length == 0">You should have at least two branches in order to open new pull request</q-card-section>
        <q-card-section v-else>
            <div class="row q-gutter-md">
                <div class="col-8">
                    <q-input
                        filled
                        v-model="title"
                        label="Pull request title"
                    />
                </div>
                <div class="col">
                    <q-select filled v-model="branch" :options="listBranches" label="Base Branch" />
                </div>
            </div>
            <q-card-actions align="around">
                <q-btn :disable="branch == ''" color="primary" label="Open new Pull Request" @click="openPullRequest()" />
            </q-card-actions>
        </q-card-section>
    </q-card> 
</template>
<script lang="ts">
import api from '../../api/backend-api';
import {mapState} from 'pinia';
import {useUserStore} from 'src/pinia/modules/user';
import {notifyError, notifyMessage} from 'src/utils/notify';


import {defineComponent, PropType} from 'vue';
export default defineComponent({
    name: 'GithubPullRequestDialog',
    emits: ['created'],
    props:{
        projectName: {
            type: String as PropType<string>,
            required: true,
        },
        repositoryName: {
            type: String as PropType<string>,
            required: true,
        }
    },
    data() {
        const branches: string[] =[];
        return {
            branches,
            title: '', 
            branch:'',
            synchronizedBranch:'',
        }
    },
    computed:{
        ...mapState(useUserStore, ['username']),
        listBranches(): string[]{
            let listBranches: string[] = [];
            listBranches = this.branches.filter((branch) => branch != this.synchronizedBranch);
            this.branch = listBranches[0];
            return listBranches;
        }
    },
    mounted(){
        this.getSynchronizedGithubRepo();
        this.getRepoBranches();
    },
    methods: {
        getSynchronizedGithubRepo() {
            api
                .getSynchronizedGithubRepository(this.projectName)
                .then((response) => {
                    this.synchronizedBranch = response.data.branch;
                })
                .catch((error) => {
                notifyError({ error });
                });
        },
        getRepoBranches(){
            api
              .getGithubRepoBranches(this.projectName, this.username, this.repositoryName)
              .then((response) => {
                this.branches = response.data;
              })
              .catch((error) => {
                notifyError(error);
              });
        },  
        openPullRequest() {
            const title = this.title + ": Opened by ArboratorGrew";
            const data = {title: title, repositoryName: this.repositoryName, branch: this.branch}
            api
              .openPullRequest(this.projectName, this.username, data)
              .then((response) => {
                notifyMessage({message: 'New pull request created'});
                this.$emit('created');
              })
              .catch((error) => {
                const errorMessage = error.response.data.message;
                notifyError({error: `${errorMessage}`});
              });
        } 
    }   
});
</script>
<style>

</style>

