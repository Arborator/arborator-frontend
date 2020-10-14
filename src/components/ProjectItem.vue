<template>
    <q-item v-show="visible" clickable @click="goTo()" >
        <q-popup-proxy transition-show="flip-up" transition-hide="flip-down" context-menu>
            <q-card>
                <q-card-section>
                    <q-list>
                        <q-item clickable @click="projectSettings()">
                            <q-item-section>{{$t('projectHub').rightClickSettings}}</q-item-section>
                            <q-item-section side>
                                <q-icon name="settings" />
                            </q-item-section>
                        </q-item>
                        <q-item clickable @click="triggerConfirm(deleteProject)">
                            <q-item-section>{{$t('projectHub').rightClickDelete}}</q-item-section>
                            <q-item-section side>
                                <q-icon name="delete_forever" color="negative"/>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
            </q-card>
        </q-popup-proxy>
        <q-item-section avatar>
          <q-avatar v-show="imageEmpty" rounded color="primary" text-color="white" icon="fas fa-tree" />
          <q-avatar v-show="!imageEmpty" rounded color="primary" text-color="white" >
              <img :src="imageCleaned"/>
          </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label lines="1"><span class="text-weight-bold">{{project.project_name}}</span></q-item-label>
            <q-item-label caption lines="2">
                {{project.description}}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-badge :color="($q.dark.isActive?'grey':'secondary')"> {{project.number_samples}} {{$t('projectHub').samples}} </q-badge>
        </q-item-section>
        <q-item-section side>
            <div class="absolute-bottom text-h6">
                <q-icon v-show="project.visibility == 0" name="lock" color="negative" size="lg"></q-icon>
                <q-icon v-show="project.visibility == 1" name="lock" color="positive" size="lg"></q-icon>
                <q-icon v-show="project.visibility == 2" name="public" color="positive" size="lg"></q-icon>
            </div>
        </q-item-section>

        <q-dialog v-model="confirmActionDial"> <confirm-action :parentAction="confirmActionCallback" :arg1="confirmActionArg1"></confirm-action> </q-dialog>
    </q-item> 
</template>

<script>
import api from '../boot/backend-api.js';
import ConfirmAction from '../components/ConfirmAction';
export default {
    components: {ConfirmAction},
    props: ['props', 'parentDeleteProject', 'parentProjectSettings'],
    data() {
        return {
            project: this.props,
            confirmActionDial: false,
            confirmActionCallback: null,
            confirmActionArg1: ''
        }
    },
    computed: {
        imageEmpty(){
            if(this.project.image == null){ this.project.image = "b''";}
            if(this.project.image == "b''" ) {return true;}
            else if(this.project.image.length < 1) {return true;}
            else{ return false; }
        },
        imageCleaned(){
            var clean = this.project.image.replace('b', '');
            clean = clean.replace(/^'/g,'');
            clean = clean.replace(/'$/g,'');
            return 'data:image/png;base64, '+clean;
        },
        visible(){
            if(!this.project.visibility == 0){ return true; }
            else{
                if(this.project.admins.includes(this.$store.getters['user/getUserInfos'].id)){ return true; }
                else if(this.project.guests.includes(this.$store.getters['user/getUserInfos'].id)){ return true; }
                else if(this.$store.getters['user/getUserInfos'].super_admin) { return true; }
                else { return false; }
            }
        }        
    },
    methods: {
        /**
         * Use the router to push (i.e. got to) a new route
         * 
         * @returns void
         */
        goTo(){
            this.$router.push({
                name: 'project',
                params: {
                    projectname: this.project.project_name,
                    infos: this.project
                }
            }) 
        },
        /**
         * Use the parent project settings function
         * 
         * @returns void
         */
        projectSettings(){ 
            this.$props.parentProjectSettings(this.project.project_name); 
        },
        /**
         * Delete a project using the parent function
         * 
         * @returns void
         */
        deleteProject(){ 
            this.$props.parentDeleteProject(this.project.project_name); 
        },
        /**
         * Wrapper to display the confirm dialog prior to executing the method
         * 
         * @param {method} method
         * @param {*} arg
         * @returns void
         */
        triggerConfirm(method, arg){
			this.confirmActionDial = true;
			this.confirmActionCallback = method;
			this.confirmActionArg1 = arg;
		}
    }
}
</script>

<style scoped>

</style>