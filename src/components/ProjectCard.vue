<template>
    <q-item clickable @click="goTo('/projects/')" > <!-- :to="'/projects/'+project.projectname"> -->
        <q-item-section avatar>
          <q-avatar v-show="imageEmpty" rounded color="primary" text-color="white" icon="next_week" />
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
export default {
    props: ['props'],
    data() {
        return {
            project: this.props
        }
    },
    computed: {
        imageEmpty(){
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
        }        
    },
    methods: {
        goTo(path){
            this.$router.push({
                name: 'project',
                params: {
                    name: this.project.projectname,
                    infos: this.project
                }
            }) 
        }
    }
}
</script>

<style scoped>

</style>