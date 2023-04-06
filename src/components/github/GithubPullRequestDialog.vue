<template>
    <q-card style="min-width: 50vw;">
        <q-card-section>
            <div class="text-h6 text-left">Pull Request</div>
        </q-card-section>
        <q-separator />
        <q-card-section v-if="listBranches.length == 1">You should have at least two branches in order to open new pull request</q-card-section>
        <q-card-section v-if="listBranches.length > 1">
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


import {defineComponent} from 'vue';
export default defineComponent({
    name: 'GithubPullRequestDialog',
    props:['projectName', 'repositoryName'],
    data() {
        const listBranches: string[] =[];
        return {
            listBranches: [],
            title: '', 
            branch:'',
        }
    },
    computed:{
        ...mapState(useUserStore, ['username']),
    },
    mounted(){
        this.getRepoBranches();
    },
    methods: {
        getRepoBranches(){
            api
              .getGithubRepoBranches(this.projectName, this.username, this.repositoryName)
              .then((response) => {
                this.listBranches = response.data;
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

