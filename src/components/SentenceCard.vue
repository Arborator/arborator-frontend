<template>
    <q-card :id="index" style="max-width:90vw">
        <q-card-section>
            <!-- <conll-graph :conll="sample" :user="index"></conll-graph> -->
            <!-- <div id='youhou'></div> -->
            <!-- <conll-graph :props="sample"></conll-graph> -->
            <!-- {{Object.keys(sample)[0]}} -->
            <!-- <conll>{{sample.gold}}</conll> -->
            <q-tabs v-model="tab" class="text-teal" >
                <q-tab v-for="user in Object.keys(sample)" :key="user" :props="user" :label="user" :name="user" icon="person" />
            </q-tabs>
            <q-separator />

            <q-tab-panels v-model="tab" animated>
                <q-tab-panel v-for="(tree, user) in sample" :key="user" :props="tree" :name="user">
                    <conll-graph :conll="tree" :user="user" :sentenceId="sentenceId"></conll-graph>
                    <!-- {{tree}} -->
                </q-tab-panel>
            </q-tab-panels>
            <!-- <div class="q-pa-md">
<div class="q-gutter-y-md" style="max-width: 600px">
            <q-tabs v-model="tab" dense class="bg-grey-2 text-teal" >
                <q-tab dense name="mail" />
            </q-tabs>
</div>
            </div> -->
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

    }
}
</script>