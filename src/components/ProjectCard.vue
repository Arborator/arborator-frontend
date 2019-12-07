<template>
    <q-card :class="(hover ? 'shadow-12' : '')" class="clickable my-card grid-style-transition shadow-2 "
      @mouseover="hover = true" @mouseleave="hover = false" @click="goTo()" :style="hover ? 'transform: scale(0.95);' : ''">
        <q-img :src="imageEmpty?'https://picsum.photos/200/100':imageCleaned" basic >
            <div class="absolute-bottom text-h6">
                <q-icon v-show="project.is_private" name="lock" color="negative" size="lg"></q-icon>
                <q-icon v-show="!project.is_private" name="public" color="positive" size="lg"></q-icon>
                {{project.projectname}}
            </div>
        </q-img>
        <q-card-section>
            <q-item>
                <q-item-label>{{project.description}}</q-item-label>
            </q-item>
        </q-card-section>
    </q-card>

</template>

<script>
export default {
    props: ['props'],
    data() {
        return {
            project: this.props,
            hover: false
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
        goTo(){
            this.$router.push({
                name: 'project',
                params: {
                    projectname: this.project.projectname,
                    infos: this.project
                }
            }) 
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