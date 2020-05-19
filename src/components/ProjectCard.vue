<template>
    <q-card v-show="visible" :class="(hover ? 'shadow-12' : '')" class="clickable my-card grid-style-transition shadow-2 "
      @mouseover="hover = true" @mouseleave="hover = false" @click="goTo()" :style="hover ? 'transform: scale(0.95);' : ''">
        <q-popup-proxy transition-show="flip-up" transition-hide="flip-down" context-menu>
            <q-card>
                <q-card-section>
                    <q-list>
                        <q-item clickable @click="projectSettings()">
                            <q-item-section>Settings</q-item-section>
                            <q-item-section side>
                                <q-icon name="settings" />
                            </q-item-section>
                        </q-item>
                        <q-item clickable @click="triggerConfirm(deleteProject)" >
                            <q-item-section>Delete Project</q-item-section>
                            <q-item-section side>
                                <q-icon name="delete_forever" color="negative"/>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
            </q-card>
        </q-popup-proxy>
        <q-img :ratio="16/9" :src="imageEmpty?'../statics/project.jpg':imageCleaned" basic >
            <div class="absolute-bottom text-h6">
                <q-icon v-show="project.is_private" name="lock" color="negative" size="lg"></q-icon>
                <q-icon v-show="!project.is_private" name="public" color="positive" size="lg"></q-icon>
                {{project.projectname}}
            </div>
        </q-img>
        <q-card-section>
            <q-item class="justify-around q-px-md">
                <q-item-label>{{project.description}}</q-item-label>
            </q-item>

            <q-card-actions vertical class="justify-around q-px-md">
                <q-badge :color="($q.dark.isActive?'grey':'secondary')"> {{project.number_samples}} samples </q-badge>
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
            if(!this.project.is_private){ return true; }
            else{
                if(this.project.admins.includes(this.$store.getters.getUserInfos.id)){ return true; }
                else if(this.project.guests.includes(this.$store.getters.getUserInfos.id)){ return true; }
                else if(this.$store.getters.getUserInfos.super_admin) { return true; }
                else { return false; }
            }
        }      
    },
    methods: {
        goTo(){
            this.$router.push({
                name: 'project',
                params: {
                    projectname: this.project.projectname,
                    infos: this.project
                }
            }) 
        },
        projectSettings(){ this.$props.parentProjectSettings(this.project.projectname); },
        deleteProject(){ this.$props.parentDeleteProject(this.project.projectname); },
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