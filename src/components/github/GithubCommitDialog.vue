<template>
    <q-card style="min-width: 50vw;">
        <q-card-section>
            <div class="text-h6 text-left">Commit changes</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="text-body2 text-weight-light text-justify" :class="$q.dark.isActive ? 'text-white' : 'text-blue-grey-10'"> All the made commits are pushed to a separate remote branch named arboratorgrew in order to not impact your Master branch. Once you are sure about your changes you can easily merge the changes to your master branch from Github    </q-card-section>
        <q-card-section>
            <q-form class="q-gutter-md">
                <div class="row">
                    <div class="col-8">
                        <q-input
                            filled
                            v-model="message"
                            label="Commit message"
                        />
                    </div>
                    <div class="col">
                        <q-btn-dropdown class="float-right" size="md" color="primary" label="Select trees to commit">
                            <q-list>
                                <q-item v-close-popup clickable @click="commitChanges(username)">
                                    <q-item-section avatar>
                                        <q-avatar size="1.2rem">
                                            <img :src="avatar" />
                                        </q-avatar>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>Commit My trees</q-item-label>
                                    </q-item-section>
                                </q-item>

                                <q-item v-close-popup clickable @click="commitChanges('last')">
                                    <q-item-section avatar>
                                        <q-avatar size="1.2rem">
                                            <img :src="avatar" />
                                            <q-badge floating transparent color="principal">+</q-badge>
                                        </q-avatar>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>Commit my trees filled the most recent ones</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-btn-dropdown>
                    </div>
                </div>
            </q-form>
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
    name: 'GithubCommitDialog',
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
        return {
            options: ['My trees Filled with the most recent one', 'My trees'],
            message: '', 
        }
    },
    computed:{
        ...mapState(useUserStore, ['username', 'avatar']),
    },
    methods: {
        commitChanges(userType: string){
            const githubMessage =  this.message + ': committed by ArboratorGrew';
            const data = {message: githubMessage, repositoryName: this.repositoryName, userType: userType};
            api
              .commitChanges(this.projectName, this.username, data)
              .then((response) => {
                notifyMessage({message: `new commit in "${ this.repositoryName}"`});
                this.$emit('committed')
              })
              .catch((error) => {
                const errorMessage = error.response.data.message
                notifyError({error: `${errorMessage}`})
              });
        },
       
    }   
});
</script>
<style>

</style>

