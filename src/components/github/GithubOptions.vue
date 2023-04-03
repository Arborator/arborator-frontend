<template>
    <q-btn-dropdown
      outline
      split
      color="primary"
      no-caps
      icon="fab fa-github"
      label="Github Options"
    >
        <q-list>
            <q-item :disable="changesNumber == 0" clickable v-close-popup @click="isShowCommitDialog = true">
                <q-item-section avatar>
                    <q-avatar icon="commit" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>commit</q-item-label>
                    <q-item-label caption>You have {{changesNumber}} changes to commit</q-item-label>
                </q-item-section>
                <q-item-section side top>
                    <q-badge color="primary" :label="changesNumber" />
                </q-item-section>
            </q-item>
            <q-item clickable :disable="!checkPulls" v-close-popup @click="pullChanges()
            ">
                <q-item-section avatar>
                    <q-avatar icon="ion-md-git-pull-request" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Pull</q-item-label>
                    <q-item-label v-if="checkPulls" caption> there is changes to pull</q-item-label>
                    <q-item-label v-else caption> there is nothing to pull</q-item-label>
                </q-item-section>
                <q-item-section v-if="checkPulls" side>
                    <q-icon name="info" color="amber" />
                </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="deleteSynchronization()">
                <q-item-section avatar>
                    <q-avatar icon="cancel_presentation" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Remove synchronization</q-item-label>
                    <q-item-label caption>Your project is synchronized with {{repositoryName}}</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </q-btn-dropdown>
    <q-dialog v-model="isShowCommitDialog">
        <GithubCommitDialog :projectName="projectName" :repositoryName="repositoryName" @committed="reloadAfterCommit" />
    </q-dialog>
</template>
<script lang="ts">
import GithubCommitDialog from './GithubCommitDialog.vue'
import api from '../../api/backend-api';
import {mapState} from 'pinia';
import {useUserStore} from 'src/pinia/modules/user';
import {notifyError, notifyMessage} from 'src/utils/notify';


import {defineComponent} from 'vue';
export default defineComponent({
    components: {
        GithubCommitDialog,
    },
    name: 'GithubOptions',
    props:['projectName', 'repositoryName'],
    data() {
        return {
            isShowCommitDialog: false,
            checkPulls: false,
            changesNumber: 0,
            intr: setTimeout(() => {}, 0),
        }
    },
    computed:{
        ...mapState(useUserStore, ['username']),
    },
    mounted() {
        this.intr = setInterval(this.getPulls, 60000)
        this.getChanges();
        this.getPulls();
    },
    methods: {
        getChanges() {
            api
              .getChanges(this.projectName, this.username)
              .then((response) => {
                this.changesNumber = response.data;
              })
              .catch((error) => {
                notifyError({error});
              });
        }, 
        getPulls() {
            api
              .checkPull(this.projectName, this.username)
              .then((response) => {
                this.checkPulls = response.data;
              })
              .catch((error) => {
                notifyError({error});
              });
        },
        deleteSynchronization() {
            api
              .deleteSynchronization(this.projectName, this.username)
              .then((response) => {
                notifyMessage({message: `The synchronization with "${this.repositoryName}" is removed`});
                this.$emit("remove-sync")
              })
              .catch((error) => {
                notifyError({error});
              });
        },
        reloadAfterCommit() {
            this.isShowCommitDialog = false;
            this.getChanges();
        }, 
        pullChanges() {
            const data = {repositoryName : this.repositoryName}
            api
              .pullChanges(this.projectName, this.username, data)
              .then((response) => {
                    notifyMessage({message: `The changes from ${this.repositoryName} are pulled in ${this.projectName}`})
               })
              .catch((error) => {
                    notifyError({error});
              });

        }
    }   
});
</script>
<style>

</style>

