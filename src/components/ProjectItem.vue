<template>
    <q-item clickable @click="goTo()" >
        <q-popup-proxy transition-show="flip-up" transition-hide="flip-down" context-menu>
            <q-list>
                <q-item clickable @click="deleteProject()">
                <q-item-section>Delete Project</q-item-section>
                <q-item-section side>
                    <q-icon name="delete_forever" color="negative"/>
                </q-item-section>
                </q-item>
            </q-list>
        </q-popup-proxy>
        <q-item-section avatar>
          <q-avatar v-show="imageEmpty" rounded color="primary" text-color="white" icon="work" />
          <q-avatar v-show="!imageEmpty" rounded color="primary" text-color="white" >
              <img :src="imageCleaned"/>
          </q-avatar>
        </q-item-section>
        <q-item-section>
            <q-item-label lines="1"><span class="text-weight-bold">{{project.projectname}}</span></q-item-label>
            <q-item-label caption lines="2">
                {{project.description}}
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-icon v-show="project.is_private" name="lock" color="negative"></q-icon>
            <q-icon v-show="!project.is_private" name="public" color="positive"></q-icon>
        </q-item-section>
    </q-item> 
</template>

<script>
import api from '../boot/backend-api.js';
export default {
    props: ['props', 'parentDeleteProject'],
    data() {
        return {
            project: this.props
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
        deleteProject(){ this.$props.parentDeleteProject(this.project.projectname); }
    }
}
</script>

<style scoped>

</style>