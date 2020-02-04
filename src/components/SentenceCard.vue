<template>
    <q-card :id="index" >
        <q-toolbar :class="$q.dark.isActive?'text-white':'text-primary'">
            <q-btn flat round dense icon="save" :disable="!lastModified.dirty" @click="save()"> <q-tooltip>Save this tree</q-tooltip> </q-btn>
            <!-- <q-btn flat round dense icon="archive" ><q-tooltip>Export</q-tooltip></q-btn> -->
            <q-btn flat round dense icon="undo" :disable="!lastModified.dirty" @click="undo()"><q-tooltip>Undo</q-tooltip></q-btn>
            <q-btn flat round dense icon="redo" :disable="!lastModified.redo"><q-tooltip>Redo</q-tooltip></q-btn>
            <q-toolbar-title>
            </q-toolbar-title>
            <q-btn flat round dense icon="more_vert" />
        </q-toolbar>
        <q-card-section>
            <q-chip icon="bookmark" class="text-center" :color="$q.dark.isActive?'primary':''" dense> {{sentenceId}} </q-chip>{{sampleData.sentence}}
            <q-tabs v-model="tab" :class="($q.dark.isActive?'text-grey-5':'text-grey-8') + ' shadow-2'" dense :active-color="$q.dark.isActive?'info':'accent'" :active-bg-color="$q.dark.isActive?'':'grey-2'">
                <q-tab v-for="(tree, user) in sampleData.conlls" :key="user" :props="user" :label="user" :name="user" icon="person" no-caps :ripple="false" />
            </q-tabs>
            <q-separator />
            <q-tab-panels v-model="tab" keep-alive >
               
                <q-tab-panel v-for="(tree, user) in sampleData.conlls" :key="user" :props="tree" :name="user">
                    <q-card  flat >
                        <q-card-section :class="($q.dark.isActive?'':'') + ' scrollable'" >
                            <conll-graph :conll="tree" :user="user" :sentenceId="sentenceId" :matches="sampleData.matches" @update-conll="onConllGraphUpdate($event)"></conll-graph>
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
    props: ['index', 'sample', 'sentenceId'],
    data() {
        return {
            tab:'',
            sampleData: this.$props.sample,
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
        // save() {
        //     console.log(this.lastModified.conll);
        //     var timestamp = Date.now();
        //     console.log("time", timestamp);
        //     this.lastModified.conll = this.lastModified.conll.replace(/# timestamp = \d+\.\d+\n/, "# timestamp = "+timestamp+"\n");
        //     console.log("after", this.lastModified.conll);
        //     this.lastModified.conll = this.lastModified.conll.replace(/# user_id = \d+\.\d+\n/, "# user_id = "+this.$store.getters.getUserInfos.username+"\n");
        //     // console.log("after", this.lastModified.conll);
        //     var data={"trees":[{"sent_id":this.$props.sentenceId, "conll":this.lastModified.conll}], "user_id":this.$store.getters.getUserInfos.username};
        //     console.log(data);
        //     api.saveTrees(this.$route.params.projectname, this.$props.sample.samplename, data).then(response => {
        //         if(response.status == 200){
        //             this.lastModified.dirty = false;
        //             this.showNotif('top', 'saveSuccess');
        //         }
        //     }).catch(error => {console.log(error); this.showNotif('top', 'saveFail');});
        // }
        save() {
            
            var timestamp = Date.now();
            console.log("timestamp", timestamp);
            this.lastModified.conll = this.lastModified.conll.replace(/# user_id = .+\n/, "# user_id = "+this.$store.getters.getUserInfos.username+"\n");
            this.lastModified.conll = this.lastModified.conll.replace(/# timestamp = \d+(\.\d*)?\n/, "# timestamp = "+timestamp+"\n");
            console.log("after", this.lastModified.conll);
            var data={"trees":[{"sent_id":this.sentenceId, "conll":this.lastModified.conll}], "user_id":this.$store.getters.getUserInfos.username};
            // console.log("data", data);
            api.saveTrees(this.$route.params.projectname, this.$props.sample.samplename, data).then(response => {
                if(response.status == 200){
                    this.lastModified.dirty = false;
                    console.log("status", this.lastModified.dirty);
                    console.log("user", this.$store.getters.getUserInfos.username);
                    this.showNotif('top', 'saveSuccess');
                    this.sampleData.conlls[this.$store.getters.getUserInfos.username] = this.lastModified.conll; this.$forceUpdate();
                    this.tab = this.$store.getters.getUserInfos.username;
                }
            }).catch(error => {  this.$store.dispatch("notifyError", {error: error}); });
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