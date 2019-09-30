<template>
    <q-card :id="index" style="max-width:90vw">
        <q-card-section>
            <q-chip icon="bookmark" class="text-center" dense> {{index}} </q-chip>{{conllToTree(sample[Object.keys(sample)[0]]).sentence}}
            <q-tabs v-model="tab" class="text-teal flex-center" dense>
                <q-tab v-for="(tree, user) in sample" :key="user" :props="user" :label="user" :name="user" icon="person" />
            </q-tabs>
            <q-separator />

            <q-tab-panels v-model="tab" animated>
                <q-tab-panel v-for="(tree, user) in sample" :key="user" :props="tree" :name="user">
                    <q-card  flat >
                    <q-card-section class="scrollable" style="height: 200px;">
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
    props: ['index', 'sample', 'sentenceId'],
    data() {
        return {
            tab:''
        }
    },
    mounted() {
    },
    methods: {
        conllToTree(strTree){
            var draft = new ArboratorDraft();
            return draft.getTree(strTree);
        }
    }
}
</script>

<style scoped>
.scrollable {
    overflow:scroll;
}
</style>