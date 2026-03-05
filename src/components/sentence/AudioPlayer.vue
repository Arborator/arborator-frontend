<template>
     <audio ref="audioPlayer" :src="currentUrl" @play="audioPlay" @pause="audioPause" 
        @seeking="audioSeeking" controls 
        style="margin: 0.5%; width: 30%;">
      </audio>

      <div ref="text" style="margin: 0.5%;">
        <span
            v-for="item in spans"
            :class="item.class + ' clickable'"
            @click="clickWord(item.begin)"
            @dblclick="dblClickWord"
        >
            {{ item.text }}
        </span>
      </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

import { grewSearchResultSentence_t } from 'src/api/backend-types';
import { reactive_sentences_obj_t } from 'src/types/main_types';

export default defineComponent({
    name: "AudioPlayer",
    props: {
        sentenceData: {
            type: Object as PropType<grewSearchResultSentence_t>,
            required: true,
        },
        reactiveSentencesObj: {
            type: Object as PropType<reactive_sentences_obj_t>,
            required: true,
        },
    },
    data() {
        return {
         currentUrl: '',
         conllData: '',
         audioTokens: [{begin: 0, end: 0 , word: ""}],
         audioBegin: 0,
         audioEnd : 0,
         audioIntervalId: setInterval(this.update(), 0),
         audioSpeakingIndex: 0,
         spans: [] as Array<{
            text: string
            begin: number
            class?: string
        }>
        }
    },
    mounted(){
            this.conllData = this.sentenceData.conlls[this.getUserId()]
            this.currentUrl = this.getSoundUrl()
            this.audioTokens = this.getAudioTokens()
            if (this.audioTokens.length > 0){
                this.audioEnd = this.audioTokens[this.audioTokens.length -1].end
                this.audioBegin = this.audioTokens[0].begin
            }
            this.setText()
            clearInterval(this.audioIntervalId)
            this.audioInit()
    },
    methods: {
        getUserId(){
            const id = Object.entries(this.reactiveSentencesObj)[0][0]
            if (id !== undefined){
                 return id
            }
            return '';
        },
        getSoundUrl() {
            const soundUrl = this.reactiveSentencesObj[this.getUserId()].state.metaJson.sound_url
            if (soundUrl !== null){
                return soundUrl.toString()
            }
            return "";
        },
        getAudioTokens(){
            const regex = /AlignBegin=(\d+)\|AlignEnd=(\d+)(?:\||\n|$)/g
            const form = this.reactiveSentencesObj[this.getUserId()].state.treeJson.nodesJson
            const matches = [...this.conllData.matchAll(regex)];
            let index = 1;
            return matches.map(m => {
                const begin = parseFloat(m[1]);
                const end = parseFloat(m[2]);
                const word = form[index].FORM;
                index++
                return {
                    begin: begin/1000,
                    end : end/1000,
                    word : word
                };
            });
        },
        audioInit() {
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (!audioPlayer) return
            audioPlayer.currentTime = this.audioBegin
            //audioPlayer.pause()
        },
        audioPlay(){
            if (this.audioTokens != undefined && this.audioTokens.length > 0){
                this.audioIntervalId = setInterval(() => {
                    this.update()
                }, 50)
            }
        },
        update(){
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer != undefined){
                if (audioPlayer.currentTime >= this.audioEnd){
                    audioPlayer.pause()
                } else {          
                    let token_data = this.audioTokens[this.audioSpeakingIndex]
                    let token_end = Number(token_data.end) 
                    if (audioPlayer.currentTime > token_end) {
                        //color text
                        this.speakingToken(this.audioSpeakingIndex + 1)
                    }
                }
            }
        },
        audioPause(){
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer != undefined){
                if (this.audioTokens != undefined && this.audioTokens.length > 0){
                    if (this.audioIntervalId){
                        clearInterval(this.audioIntervalId)
                    }
                    if (audioPlayer.currentTime >= this.audioEnd) {
                        audioPlayer.currentTime = this.audioBegin
                    }
                }
            }
        },
        audioSeeking(){
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer != null){
                if (this.audioTokens != undefined && this.audioTokens.length > 0) {
                    let pos = 0
                    this.audioTokens.forEach (function (node,index) {
                        let begin = node.begin
                        let end =  node.end
                        if (audioPlayer.currentTime >= begin && audioPlayer.currentTime <= end) {
                            pos = index;
                        }
                    })
                    this.speakingToken(pos)
                }
            } 
        },
        speakingToken(position : number){
            let prev_word = this.spans[this.audioSpeakingIndex]
            prev_word.class = " ";
            let newWord = this.spans[position]
            this.audioSpeakingIndex = position
            newWord.class = "speaking"
        },
        setText() {
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (this.audioTokens && this.audioTokens.length > 0) {
                this.spans = this.audioTokens.map((node) => ({
                    text: " " + node.word,
                    begin: Number(node.begin),
                    class: ""
                }))
            } 
        },
        clickWord(begin : number) {
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer){
                audioPlayer.currentTime = begin
            }
        },
        dblClickWord() {
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer){
                audioPlayer.play()
            }
        },
    }
})
</script>

<style lang="css">
.speaking{
    background-color: yellow;
}
.clickable:hover {
    cursor: pointer;
}
</style>