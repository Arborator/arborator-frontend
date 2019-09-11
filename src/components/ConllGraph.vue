<template>
    <conll id='conll'></conll>
</template>

<script>
import Vue from 'vue'
Vue.config.ignoredElements = ['conll'];
export default {
    name:'conllGraph',
    props: ['sample'],
    data(){

    },
    mounted(){
        console.log(this.sample)
        this.start('#conll')
    },
    methods: {
        start(id){
            var draft = new ArboratorDraft();
            var svg = draft.getSvg(this.test, id);
        }
    }
}
</script>