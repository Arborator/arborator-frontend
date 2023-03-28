<template>
    <q-card class="" style="min-width: 50vw;">
        <q-card-section>
            <div class="text-h6 text-left">Commit change</div>
            <q-form class="q-gutter-md" @submit="commitChanges">
                <q-input
                    v-model="message"
                    label="Commit message"
                />
                <q-btn color="primary"  type="submit">Commit</q-btn>
            </q-form>
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
    name: 'GithubCommitDialog',
    props:['projectName', 'repositoryName'],
    data() {
        return {
            message:''
        }
    },
    computed:{
        ...mapState(useUserStore, ['username']),
    },
    methods: {
        commitChanges(){
            const githubMessage =  this.message + ' :commited by Arborator-Grew';
            const data = {message: githubMessage, repositoryName: this.repositoryName}
            api
              .commitChanges(this.projectName, this.username, data)
              .then((response) => {
                notifyMessage({message: `new commit in "${ this.repositoryName}"`})
                this.$emit('committed')
              })
              .catch((error) => {
                notifyError({error})
              })
        }
       
    }   
});
</script>
<style>

</style>

