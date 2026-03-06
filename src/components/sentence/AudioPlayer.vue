<template>
    <div v-if="hasToken()" ref="text" style="margin: 0.5%;">
        <span
            v-for="item in spans"
            :class="item.class + ' clickable'"
            @click="clickWord(item.begin)"
            @dblclick="dblClickWord"
        >
            {{ item.text }}
        </span>
    </div>

    <audio 
        ref="audioPlayer" 
        preload="auto"
        :src="currentUrl"
        @play="audioPlay" 
        @pause="audioPause" 
        @seeking="audioSeeking" 
        controls 
        style="margin: 0.5%; width: 30%;"
    ></audio>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { reactive_sentences_obj_t } from 'src/types/main_types';

export default defineComponent({
    name: "AudioPlayer",
    props: {
        reactiveSentencesObj: {
            type: Object as PropType<reactive_sentences_obj_t>,
            required: true,
        },
    },
    data() {
        return {
         currentUrl: '',
         audioTokens: [] as { begin: number; end: number; word: string; }[],
         audioBegin: 0, //timeCode début de la phrase
         audioEnd : 0, //timeCode fin de la phrase
         audioIntervalId: setInterval(this.update(), 0), 
         audioSpeakingIndex: 0, //index du mot actuellement prononcé 
         spans: [] as Array<{   
            text: string
            begin: number
            class?: string
         }>
        }
    },
    mounted(){
            this.currentUrl = this.getSoundUrl()
            this.audioTokens = this.getAudioTokens()
            if (this.hasToken()){
                this.audioEnd = this.audioTokens[this.audioTokens.length -1].end
                this.audioBegin = this.audioTokens[0].begin
                this.setText()
            }
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
            const form = this.reactiveSentencesObj[this.getUserId()].state.treeJson.nodesJson
            let result = [] as { begin: number; end: number; word: string; }[];
            if (form[1].MISC.AlignBegin && form[1].MISC.AlignEnd){
                 result = Object.values(form).map((token) =>({
                        begin : Number(token.MISC.AlignBegin)/1000,
                        end : Number(token.MISC.AlignEnd)/1000,
                        word : token.FORM
                 }))
            }
            return result;
        },
        audioInit() {
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer != undefined) {
                audioPlayer.currentTime = this.audioBegin
            } 
        },
        audioPlay(){
            if (this.hasToken()){
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
                        this.speakingToken(this.audioSpeakingIndex + 1)
                    }
                }
            }
        },
        audioPause(){
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer != undefined){
                if (this.hasToken()){
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
                if (this.hasToken()) {
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
            if (this.hasToken()) {
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
        hasToken(){
            return (this.getAudioTokens() != undefined && this.getAudioTokens().length > 0 )
        }
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