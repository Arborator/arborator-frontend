<template>
    <q-card :id="index" style="max-width:99vw">
        <q-toolbar class="text-primary">
            <q-btn flat round dense icon="save" :disable="!lastModified.dirty" @click="save()"> <q-tooltip>Save this tree</q-tooltip> </q-btn>
            <q-btn flat round dense icon="archive" ><q-tooltip>Export</q-tooltip></q-btn>
            <q-btn flat round dense icon="undo" :disable="!lastModified.dirty"><q-tooltip>Undo</q-tooltip></q-btn>
            <q-btn flat round dense icon="redo" :disable="!lastModified.redo"><q-tooltip>Redo</q-tooltip></q-btn>
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
                        <conll-graph :conll="tree" :user="user" :sentenceId="sentenceId" @update-conll="onConllGraphUpdate($event)"></conll-graph>
                    </q-card-section>
                    </q-card>

                </q-tab-panel>
            </q-tab-panels>
        </q-card-section>
    </q-card>
</template>

<script>
import ConllGraph from './ConllGraph'

export default {
    name:'SentenceCard',
    components: {
        ConllGraph
    },
    props: ['index', 'sample', 'sentenceId', 'sentence', 'projectname'],
    data() {
        return {
            tab:'',
            lastModified: { svgId: '',  draft: '', dirty: false, redo: false }
        }
    },
    mounted() {
    },
    methods: {
        save(conll, username) {
            this.lastModified.draft.getConll();
        },
        onConllGraphUpdate(payload) { this.lastModified = payload; }
    }
}
</script>

<style scoped>
.scrollable {
    overflow:scroll;
}
</style>