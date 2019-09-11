<template>
    <conll :id="id"></conll>
</template>

<script>
import Vue from 'vue'
Vue.config.ignoredElements = ['conll'];
export default {
    name:'conllGraph',
    props: ['conll', 'user', 'sentenceId'],
    data(){
        return {
            id: this.user+ this.sentenceId.replace(/\W/g, '')
        }
    },
    mounted(){
        this.start(this.conll, this.id);
    },
    methods: {
        start(conllStr, id){
            var draft = new ArboratorDraft();
            var svg = draft.getSvg(conllStr, '#'+id);
        }
    }
}
</script>