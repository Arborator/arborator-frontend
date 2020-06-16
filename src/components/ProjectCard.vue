<template>
    <q-card v-show="visible" :class="(hover ? 'shadow-12' : '')" class="clickable my-card grid-style-transition shadow-2 "
      @mouseover="hover = true" @mouseleave="hover = false" @click="goTo()" :style="hover ? 'transform: scale(0.95);' : ''">
        <q-popup-proxy v-if="canSeeSettings" transition-show="flip-up" transition-hide="flip-down" context-menu>
            <q-card >
                <q-card-section>
                    <q-list >
                        <q-item clickable @click="projectSettings()">
                            <q-item-section>{{$t('projectHub').rightClickSettings}}</q-item-section>
                            <q-item-section side>
                                <q-icon name="settings" />
                            </q-item-section>
                        </q-item>
                        <q-item clickable @click="triggerConfirm(deleteProject)" >
                            <q-item-section>{{$t('projectHub').rightClickDelete}}</q-item-section>
                            <q-item-section side>
                                <q-icon name="delete_forever" color="negative"/>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
            </q-card>
        </q-popup-proxy>
        <q-img :ratio="16/9" :src="imageEmpty?'../statics/images/niko-photos-tGTVxeOr_Rs-unsplash.jpg':imageCleaned" basic >
            <div class="absolute-bottom text-h6">
                <q-icon v-show="project.visibility == 0" name="lock" color="negative" size="lg"></q-icon>
                <q-icon v-show="project.visibility == 1" name="lock" color="positive" size="lg"></q-icon>
                <q-icon v-show="project.visibility == 2" name="public" color="positive" size="lg"></q-icon>
                {{project.projectname}}
            </div>
        </q-img>
        <q-card-section>
            <q-item class="justify-around q-px-md">
                <q-item-label>{{project.description}}</q-item-label>
            </q-item>

            <q-card-actions vertical class="justify-around q-px-md">
                <q-badge :color="($q.dark.isActive?'grey':'secondary')"> {{project.number_samples}} {{$t('projectHub').samples}} </q-badge>
            </q-card-actions>
        </q-card-section>

        <q-dialog v-model="confirmActionDial"> <confirm-action :parentAction="confirmActionCallback" :arg1="confirmActionArg1"></confirm-action> </q-dialog>
    </q-card>

</template>

<script>

import ConfirmAction from '../components/ConfirmAction';

export default {
    components: {ConfirmAction},
    props: ['props', 'parentDeleteProject', 'parentProjectSettings'],
    data() {
        return {
            project: this.props,
            hover: false,
            confirmActionDial: false,
            confirmActionCallback: null,
            confirmActionArg1: ''
        }
    },
    computed: {
        canSeeSettings() {
            if (!this.$store.getters.isLoggedIn) {return false}
            if(this.project.admins.includes(this.$store.getters.getUserInfos.id)){ return true; }
            else if(this.$store.getters.getUserInfos.super_admin) { return true; }
            else { return false; }

        },
        imageEmpty(){
            if(this.project.image == null){ this.project.image = "b''";}
            if(this.project.image == "b''") {return true;}
            else if(this.project.image.length < 1) {return true;}
            else{
                return false;
            }
        },
        imageCleaned(){
            var clean = this.project.image.replace('b', '');
            clean = clean.replace(/^'/g,'');
            clean = clean.replace(/'$/g,'');
            return 'data:image/png;base64, '+clean;
        },
        visible(){
            // show all projects regardless of their visibility status
            return true

            // only show non-private projects
            // if(!this.project.visibility == 0){ return true; }
            // else{
            //     if(this.project.admins.includes(this.$store.getters.getUserInfos.id)){ return true; }
            //     else if(this.project.guests.includes(this.$store.getters.getUserInfos.id)){ return true; }
            //     else if(this.$store.getters.getUserInfos.super_admin) { return true; }
            //     else { return false; }
            // }
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
                    projectname: this.project.projectname,
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
            this.$props.parentProjectSettings(this.project.projectname); 
        },
        /**
         * Delete a project using the parent function
         * 
         * @returns void
         */
        deleteProject(){ 
            this.$props.parentDeleteProject(this.project.projectname); 
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


<style scoped lang="stylus">
.clickable:hover {
  cursor:pointer;
}

.grid-style-transition
  transition transform .28s, background-color .28s

.my-card 
  width: 100%
  
</style>