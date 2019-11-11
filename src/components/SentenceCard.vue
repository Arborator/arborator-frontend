<template>
    <q-card :id="index" style="max-width:99vw">
        <q-toolbar class="text-primary">
            <q-btn flat round dense icon="save" :disable="!dirty" > <q-tooltip>Save this tree</q-tooltip> </q-btn>
            <q-btn flat round dense icon="archive" ><q-tooltip>Export</q-tooltip></q-btn>
            <q-btn flat round dense icon="undo" ><q-tooltip>Undo</q-tooltip></q-btn>
            <q-btn flat round dense icon="redo" ><q-tooltip>Redo</q-tooltip></q-btn>
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
                        <conll-graph :conll="tree" :user="user" :sentenceId="sentenceId"></conll-graph>
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
    props: ['index', 'sample', 'sentenceId', 'sentence'],
    data() {
        return {
            tab:'',
            dirty: true
        }
    },
    mounted() {
    },
    methods: {
        // mettre save ici
    }
}
</script>

<style scoped>
.scrollable {
    overflow:scroll;
}
</style>