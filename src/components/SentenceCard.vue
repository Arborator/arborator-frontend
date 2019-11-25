<template>
    <q-card :id="index" style="max-width:99vw">
        <q-toolbar class="text-primary">
            <q-btn flat round dense icon="save" :disable="!lastModified.dirty" @click="save()"> <q-tooltip>Save this tree</q-tooltip> </q-btn>
            <q-btn flat round dense icon="archive" ><q-tooltip>Export</q-tooltip></q-btn>
            <q-btn flat round dense icon="undo" :disable="!lastModified.dirty" @click="undo()"><q-tooltip>Undo</q-tooltip></q-btn>
            <q-btn flat round dense icon="redo" :disable="!lastModified.redo"><q-tooltip>Redo</q-tooltip></q-btn>
             <!-- <q-btn flat round dense icon="mail" @click="save()"><q-tooltip>Mail</q-tooltip></q-btn> -->

            <q-toolbar-title>
            </q-toolbar-title>

            <q-btn flat round dense icon="more_vert" />
        </q-toolbar>
        <q-card-section>
            <q-chip icon="bookmark" class="text-center" dense> {{index}} </q-chip>{{sentence}}
            <q-tabs v-model="tab" class="text-teal flex-center" dense>
                <q-tab v-for="(tree, user) in sample" :key="user" :props="user" :label="user" :name="user" icon="person" />
            </q-tabs>
            <q-separator />

            <q-tab-panels v-model="tab" animated>
                <q-tab-panel v-for="(tree, user) in sample" :key="user" :props="tree" :name="user">
                    <q-card  flat >
                    <q-card-section class="scrollable" >
                        <conll-graph :conll="tree" :user="user" :sentenceId="sentenceId" :samplename="samplename" :projectname="projectname" @update-conll="onConllGraphUpdate($event)"></conll-graph>
                    </q-card-section>
                    </q-card>

                </q-tab-panel>
            </q-tab-panels>
        </q-card-section>
    </q-card>
</template>

<script>
import ConllGraph from './ConllGraph'
import api from '../boot/backend-api';

export default {
    name:'SentenceCard',
    components: {
        ConllGraph
    },
    props: ['index', 'sample', 'sentenceId', 'sentence', 'projectname', "samplename"],
    data() {
        return {
            tab:'',
            lastModified: { svgId: '',  draft: '', dirty: false, redo: false, conll: '', user: '' },
            alerts: { 
                'saveSuccess': { color: 'positive', message: 'Saved!'},
                'saveFail': { color: 'negative', message: 'Oops, could not save...', icon: 'report_problem' },
            }
        }
    },
    mounted() {
    },
    methods: {
        undo() {
            // log("sentenceid", this.$props.sentenceId);
            // log("dirty user");
            // // log(this.data); // undefined
            // // log(this.lastModified);
            // log(this.$props); // index, projectname, sample...
            // log("lastsvg", this.lastModified.svgId);
        },
        save() {
            var data={"trees":[{"sent_id":this.$props.sentenceId, "conll":this.lastModified.conll}], "user_id":this.$store.getters.getUserInfos.username};
            api.saveTrees(this.$props.projectname, this.$props.samplename, data).then(response => {
                console.log(response)
                if(response.status == 200){
                    this.lastModified.dirty = false;
                    this.showNotif('top', 'saveSuccess');
                }

            }).catch(error => {console.log(error); this.showNotif('top', 'saveFail');});
        },
        onConllGraphUpdate(payload) {
            this.lastModified = payload;
        },
        showNotif (position, alert) {
            const { color, textColor, multiLine, icon, message, avatar, actions } = this.alerts[alert];
            const buttonColor = color ? 'white' : void 0;
            this.$q.notify({
                color,
                textColor,
                icon: icon,
                message,
                position,
                avatar,
                multiLine,
                actions: actions,
                timeout: 2000
            })
        }
    }
}
</script>

<style scoped>
.scrollable {
    overflow:scroll;
}
</style>