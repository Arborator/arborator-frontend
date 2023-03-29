<template>
    <q-btn-dropdown
      outline
      split
      color="primary"
      no-caps
      icon="fab fa-github"
      label="Github Options"
      @click="onMainClick"
    >
        <q-list>
            <q-item clickable v-close-popup @click="isShowCommitDialog = true">
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
            <q-item clickable v-close-popup @click="onItemClick">
                <q-item-section avatar>
                    <q-avatar icon="ion-md-git-pull-request" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>Pull</q-item-label>
                    <q-item-label caption></q-item-label>
                </q-item-section>
                <q-item-section side>
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
        <GithubCommitDialog :projectName="projectName" :repositoryName="repositoryName" />
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
            changesNumber: 0,
        }
    },
    computed:{
        ...mapState(useUserStore, ['username']),
    },
    mounted() {
        this.getChanges();
    },
    methods: {
        getChanges() {
            api
              .getChanges(this.projectName, this.username)
              .then((response) => {
                this.changesNumber = response.data;
              })
              .catch((error) => {
                notifyError({error})
              });
        }, 
        deleteSynchronization() {
            api
              .deleteSynchronization(this.projectName, this.username)
              .then((response) => {
                notifyMessage({message: `The synchronization with "${this.repositoryName}" is removed`})
                this.$emit("remove-sync")
              })
              .catch((error) => {
                notifyError({error})
              });
        }
       
    }   
});
</script>
<style>

</style>

