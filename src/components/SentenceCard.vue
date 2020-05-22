<template>
    <q-card :id="index" >
        <!-- <q-toolbar :class="$q.dark.isActive?'text-white':'text-primary'"> -->
            <!-- <q-btn flat round dense icon="save" :disable="!lastModified.dirty" @click="save()"> <q-tooltip>Save this tree</q-tooltip> </q-btn>
            <q-btn flat round dense icon="list" :disable="tab==''" @click="openMetaDialog()"> <q-tooltip>Edit this tree's metadata</q-tooltip> </q-btn> -->
            <!-- <q-btn flat round dense icon="archive" ><q-tooltip>Export</q-tooltip></q-btn> -->
            <!-- <q-btn flat round dense icon="undo" :disable="!lastModified.dirty" @click="undo()"><q-tooltip>Undo</q-tooltip></q-btn>
            <q-btn flat round dense icon="redo" :disable="!lastModified.redo"><q-tooltip>Redo</q-tooltip></q-btn> -->
            <!-- <q-toolbar-title>
            </q-toolbar-title> -->
            <!-- <q-btn flat round dense icon="more_vert" /> -->
        <!-- </q-toolbar> -->
        <q-card-section>
            <div class="row items-center">
                <!-- icon="textsms"  -->
                <span class="text-grey">{{index+1}}</span>
                <q-chip class="text-center" :color="$q.dark.isActive?'primary':''" dense> 
                    {{sentenceId}} 
                </q-chip>&nbsp;&nbsp;&nbsp;
                <template>
                    <q-input 
                    style="width:70%"
                    class="row items-center justify-center"
                    :value="sampleData.sentence"
                    v-on="$listeners"
                    v-bind="$attrs"                   
                    ref="self"
                    @select="ttselect"
                    >
                        <template v-slot:prepend>
                            <q-icon name="chat_bubble_outline" /><!-- 言 -->
                        </template>
                    </q-input>
                </template>
                <q-space/>
                 <q-btn flat round dense icon="save" :disable="!lastModified.dirty" @click="save()"> <q-tooltip>Save this tree</q-tooltip> </q-btn>
            <q-btn flat round dense icon="list" :disable="tab==''" @click="openMetaDialog()"> <q-tooltip>Edit this tree's metadata</q-tooltip> </q-btn>
                
            <q-btn-dropdown :disable="tab==''" icon="more_vert"  flat dense> <q-tooltip>More</q-tooltip>
                <q-list>
                <q-item clickable v-close-popup >
                <q-item-section>
                    <q-item-label>Get direct link to this tree (todo)</q-item-label>
                </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="getconll()">
                <q-item-section>
                    <q-item-label>Get CoNLL-U of this tree (todo)</q-item-label>
                </q-item-section>
                </q-item>

                 <q-item clickable v-close-popup >
                <q-item-section>
                    <q-item-label>Get SVG of this tree (todo)</q-item-label>
                </q-item-section>
                </q-item>

                </q-list>
            </q-btn-dropdown>
            <!-- <q-btn flat round dense icon="more_vert" /> -->
            </div>
            
            <q-tabs v-model="tab" :class="($q.dark.isActive?'text-grey-5':'text-grey-8') + ' shadow-2'" dense :active-color="$q.dark.isActive?'info':'accent'" :active-bg-color="$q.dark.isActive?'':'grey-2'">
                <q-tab v-for="(tree, user) in sampleData.conlls" :key="user" :props="user" :label="user" :name="user" icon="person" no-caps :ripple="false" :ref="'tab'+user"/>
            </q-tabs>
            <q-separator />
            <q-tab-panels v-model="tab" keep-alive >
                <q-tab-panel v-for="(tree, user) in sampleData.conlls" :key="user" :props="tree" :name="user" >
                    <q-card  flat >
                        <q-card-section :class="($q.dark.isActive?'':'') + ' scrollable'" >
                            <conll-graph
                                ref="conllGraph"
                                :conll="tree" 
                                :user="user" 
                                :sentenceId="sentenceId" 
                                :matches="sampleData.matches"
                                :id="'conllGraph'+user"
                                @update-conll="onConllGraphUpdate($event)"
                                @sentence-changed="sentenceUpdate($event)"
                                @meta-changed="metaUpdate($event)"
                            ></conll-graph>
                        </q-card-section>
                    </q-card>
                </q-tab-panel>
            </q-tab-panels>
            <q-list dense>
                <q-item v-for="m in shownmetas" :key="m.a">
                    <q-chip dense size="xs">{{m.a}}</q-chip>{{m.v}}
                </q-item>
            </q-list>
        </q-card-section>

    <q-dialog v-model="conllcontent" transition-show="fade" transition-hide="fade" >
            <div class="q-pa-md" style="max-width: 300px">
                <q-input
                v-model="conllcontent"
                filled
                type="textarea"
                />
            </div>     
        </q-dialog>

    </q-card>
 
</template>

<script>
import ConllGraph from './ConllGraph'
import api from '../boot/backend-api';

export default {
    name:'SentenceCard',
    components: {
        'conll-graph': ConllGraph
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
            },
            changed: false,
            shownmetanames: [],
            shownmetas: {},
            view: null,
            conllcontent: false,

        }
    },



    computed: {
        cannotSave(){  
            let dirty = this.lastModified.dirty;
            let open = this.$store.getters.projectConfig.is_open;
            return !dirty || !open;
        }
    },
    mounted() {
        this.shownmetanames = this.$store.getters.getProjectConfig.shownmeta;
        // console.log('scmounted',this.$refs.conllGraph)
    },
    methods: {
        getconll() {
            if ('conllGraph' in this.$refs) var cg = this.$refs.conllGraph.filter(c => c.user == this.tab)[0];
            if (cg) cg.openConllDialog();
        },
        ttselect(event) {
            // triggered if some letters of the sentence are selected
            if ('conllGraph' in this.$refs) var cg = this.$refs.conllGraph.filter(c => c.user == this.tab)[0];
            if (cg) cg.openTokenDialog( // if the user's conllGraph is open:
                event.srcElement.selectionStart,
                event.srcElement.selectionEnd,
                event.srcElement.value.substring(event.srcElement.selectionStart,event.srcElement.selectionEnd) 
                )
        },

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
                    this.sampleData.conlls[this.$store.getters.getUserInfos.username] = this.lastModified.conll; 
                    this.$forceUpdate();
                    this.tab = this.$store.getters.getUserInfos.username;
                }
            }).catch(error => { 
                this.$store.dispatch("notifyError", {error: error}); });
        },
        onConllGraphUpdate(payload) {
            // called from the ConllGraph
            // console.log('!!!!!!onConllGraphUpdate',payload)
            this.lastModified = payload;
        },
        sentenceUpdate(sentence) {
            this.sampleData.sentence = sentence;
        },
        metaUpdate(metas) {
            // console.log(this.shownmetanames,metas,)
            this.shownmetas = Object.keys(metas).filter(m => this.shownmetanames.includes(m)).map( m => ({'a':m,'v':metas[m]}));
            // console.log(this.shownmetas)
        },
        openMetaDialog() {
            // "this.tab" contains the user name, calls the openMetaDialog function in ConllGraph.vue
            this.$refs.conllGraph.filter(c => c.user == this.tab)[0].openMetaDialog();    
        },
        autoopen(user) {
            // called from Sample.vue to open specific tree
            if('tab'+user in this.$refs){
                var usertab = this.$refs['tab'+user][0];
                // console.log('autoopen',usertab,user+'_'+(parseInt(this.index)+1))
                usertab.__activate();
                setTimeout( () => {
                 document.getElementById('conllGraph'+user).scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
                }, 1000)
            }
            else {
                var t = Object.keys(this.$refs).filter(c => c.includes('tab') )[0];
                if (t!=undefined && t.length>3) this.autoopen(t.substring(3))
            }
            
 
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