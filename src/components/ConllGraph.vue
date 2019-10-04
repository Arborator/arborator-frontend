<template>
    <div>
        {{content}}
    <svg :id="id"></svg>
    </div>

    <!-- <div :id="id" v-html="svgContent"></div> -->
</template>

<script>
import Vue from 'vue'
Vue.config.ignoredElements = ['conll'];
export default {
    name:'conllGraph',
    props: ['conll', 'user', 'sentenceId'],
    data(){
        return {
            id: this.user+ this.sentenceId.replace(/\W/g, ''),
            svgContent: '',
            content: 'nothing'
        }
    },
    mounted(){
        this.start(this.conll, this.id);
    },
    methods: {
        start(conllStr, id){
            console.log('conllStr conllGraph component', conllStr)
            var draft = new ArboratorDraft();
            var svg = draft.getSvg(conllStr, '#'+id);
            svg.gael = 17;
            svg.doSmth = this.doSmth();
            // this.svgContent = svg['svg'];
            // $('#'+id).attr("display", "inline");
            // console.log("selected", this.$refs[id]);
        },
        doSmth(content) {
            this.content = content;
        }
    }
}
</script>