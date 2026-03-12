<template>
    <!-- -->
    <div v-if="hasToken()" class="q-ma-xs">
        <span v-if="isPreviousSentenceToggled() && hasPreviousSentence()"
            v-for="item in spansPrev"
            :class=" item.class +' cursor-pointer'"
            @click="clickWord(item.begin)"
            @dblclick="dblClickWord"
        >
            {{ item.text }}
        </span>
        <br>
        <span
            v-for="item in spans"
            :class="item.class + ' cursor-pointer text-red'"
            @click="clickWord(item.begin)"
            @dblclick="dblClickWord"
        >
            {{ item.text }}
        </span>
        <br>
        <span v-if="isNextSentenceToggled() && hasNextSentence()"
            v-for="item in spansNext"
            :class="item.class + ' cursor-pointer'"
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
        class="q-ma-xs audio"
    ></audio>

    <div class="q-ma-xs">
        <q-toggle 
            v-if="hasToken() && hasPreviousSentence()"
            v-model="togglePrevious"
            color="primary: purple-7"
            label="previous sentence"
            left-label
            @update:model-value="addContext()"
        />
        <q-toggle 
            v-if="hasToken() && hasNextSentence()"
            v-model="toggleNext"
            color="primary : purple-7"
            label="next sentence"
            left-label
            @update:model-value="addContext()"
        />
        <q-btn-toggle
        v-if="hasToken()"
        v-model="addSecondesModel"
        push
        glossy
        toggle-color="primary : purple-7"
        no-caps
        :disable="AddSecondesDisable"
        :options="[
          {label: '0s', value: '0', },
          {label: '3s', value: 'Three'},
          {label: '5s', value: 'Five'}
        ]"
        @update:model-value="addSecondes()"
      />
    </div>
    
</template>

<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import { reactive_sentences_obj_t } from 'src/types/main_types';

import { mapState } from 'pinia';
import { useTreesStore } from 'src/pinia/modules/trees';

export default defineComponent({
    name: "AudioPlayer",
    props: {
        reactiveSentencesObj: {
            type: Object as PropType<reactive_sentences_obj_t>,
            required: true,
        },
        index: {
            type: Number as PropType<number>,
            required: true,
        },
    },
    data() {
        return {
         currentUrl: '',
         audioTokens: [] as { begin: number; end: number; word: string; }[],
         audioBegin: 0, //timeCode début de la phrase
         audioEnd : 0, //timeCode fin de la phrase
         audioIntervalId: setInterval(this.update(), 50), 
         audioSpeakingIndex: 0, //index du mot actuellement prononcé 
         spans: [] as Array<{   
            text: string
            begin: number
            class: string
         }>,
          addSecondesModel: ref('0'),
          AddSecondesDisable: false,
          toggleNext: ref(false),
          togglePrevious: ref(false),
          spansNext: [] as Array<{   
            text: string
            begin: number
            class: string
         }>,
         audioTokensNext: [] as { begin: number; end: number; word: string; }[],
         spansPrev: [] as Array<{   
            text: string
            begin: number
            class: string
         }>,
         audioTokensPrev: [] as { begin: number; end: number; word: string; }[],
         currentSentence: 'current'
        }
    },
    computed: {
        ...mapState(useTreesStore, ["filteredTrees"] ),
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
            return '';
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
                let token_data = this.audioTokens[this.audioSpeakingIndex]
                let span = this.spans
                let sentence = "current"
                if (audioPlayer.currentTime >= this.audioEnd || audioPlayer.currentTime < this.audioBegin){
                    audioPlayer.pause()
                } else {
                    //get corresponding span (previous, current or next Sentence)
                    if(audioPlayer.currentTime < this.audioTokens[0].begin){
                        token_data = this.audioTokensPrev[this.audioSpeakingIndex]
                        span = this.spansPrev
                        sentence = "prev"
                    } else if (audioPlayer.currentTime > this.audioTokens[this.audioTokens.length - 1].end){
                        token_data = this.audioTokensNext[this.audioSpeakingIndex]
                        span = this.spansNext
                        sentence = "next"
                    }
                    
                    if(sentence !== this.currentSentence){
                    //remove highlight class on previous word when changing sentence
                        switch(sentence){
                            case "current" :if (this.spansPrev[this.audioSpeakingIndex]) this.spansPrev[this.audioSpeakingIndex].class = ""; break;
                            case "next" : if (this.spans[this.audioSpeakingIndex]) this.spans[this.audioSpeakingIndex].class = ""; break;
                            case "prev" : if (this.spansNext[this.audioSpeakingIndex]) this.spansNext[this.audioSpeakingIndex].class = ""; break;
                        }
                        this.currentSentence = sentence
                        this.audioSpeakingIndex = 0 
                    }
                    if (token_data){
                        let token_end = Number(token_data.end)
                        if (audioPlayer.currentTime > token_end) {
                            this.speakingToken(this.audioSpeakingIndex + 1, span)
                        } else {
                            this.speakingToken(this.audioSpeakingIndex , span)
                        }
                    } 
                }
            }
        },
        audioPause(){
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer != undefined && this.hasToken()){
                if (this.audioIntervalId){
                    clearInterval(this.audioIntervalId)
                }
                if (audioPlayer.currentTime >= this.audioEnd || audioPlayer.currentTime < this.audioBegin) {
                    audioPlayer.currentTime = this.audioBegin 
                }
            }
        },
        audioSeeking(){
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            let tokens = this.audioTokens
            let spans = this.spans
            let sentence = "current"
            if (audioPlayer != null && this.hasToken()){
                if (audioPlayer.currentTime < this.audioTokens[0].begin) {
                    tokens = this.audioTokensPrev
                    spans = this.spansPrev
                    sentence = "prev"
                } else if(audioPlayer.currentTime > this.audioTokens[this.audioTokens.length - 1].end 
                && audioPlayer.currentTime <= this.audioEnd){
                    tokens = this.audioTokensNext
                    spans = this.spansNext
                    sentence = "next"
                }
                const pos = this.getSpeakingTokenIndex(tokens)
                if (sentence !== this.currentSentence){
                    //remove highlight class on previous word when changing sentence
                    switch(this.currentSentence){
                        case "prev" : if(this.spansPrev[this.audioSpeakingIndex]) {this.spansPrev[this.audioSpeakingIndex].class = ""};break;
                        case "current" :if(this.spans[this.audioSpeakingIndex]) { this.spans[this.audioSpeakingIndex].class = ""};break;
                        case "next" : if(this.spansNext[this.audioSpeakingIndex]) this.spansNext[this.audioSpeakingIndex].class = "";break;
                    }
                    this.currentSentence = sentence
                }
                this.speakingToken(pos, spans)
            }
        },
         getSpeakingTokenIndex(tokens : {begin:number, end:number, word:string}[]){
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            let pos = 0
            tokens.forEach (function (node,index) {
                    let begin = node.begin
                    let end =  node.end
                    if (audioPlayer.currentTime >= begin && audioPlayer.currentTime <= end) {
                        pos = index
                    }
                })
            return pos;
        },
        speakingToken(position : number, spans : Array<{text: string;begin: number;class: string; }>) {
            let prevWord = spans[this.audioSpeakingIndex]
            if (prevWord){
                prevWord.class = " ";
            }
            let newWord = spans[position]
            if (newWord){
                this.audioSpeakingIndex = position
                newWord.class = "speaking"
            }
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
            return (this.getAudioTokens() != undefined && this.getAudioTokens().length > 0)
        },
        addSecondes(){
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            let secondesToAdd = 0
            let secondesToRetrieve = 0
            let timeBeforeEnd = audioPlayer.duration - this.audioTokens[this.audioTokens.length -1].end 
            switch(this.addSecondesModel){
                case "Three" : {
                    this.audioTokens[0].begin >= 3 ? secondesToRetrieve = 3 : secondesToRetrieve = this.audioTokens[0].begin 
                    timeBeforeEnd >= 3 ? secondesToAdd = 3 : secondesToAdd = timeBeforeEnd  
                }; break;
                case "Five" : {
                    this.audioTokens[0].begin >= 5 ? secondesToRetrieve = 5 : secondesToRetrieve = this.audioTokens[0].begin 
                    timeBeforeEnd >= 5 ? secondesToAdd = 5 : secondesToAdd = timeBeforeEnd  
                }; break;
                default : break;
            }
            this.audioBegin = this.audioTokens[0].begin - secondesToRetrieve
            this.audioEnd = this.audioTokens[this.audioTokens.length -1].end + secondesToAdd
            audioPlayer.currentTime = this.audioBegin
        },
        isNextSentenceToggled(){
            return this.toggleNext
        },
        isPreviousSentenceToggled(){
            return this.togglePrevious
        },
        hasPreviousSentence(){
            if (this.index >= 1){
                const conllPrev = Object.values(this.filteredTrees[this.index-1].conlls)[0]
                const urlPreviousSentence = conllPrev.match(/sound_url = (.*?)\n/)
                if (urlPreviousSentence !== null){
                    return  urlPreviousSentence[1] == this.getSoundUrl()
                }
            }
            return false
        },
        hasNextSentence(){
            if (this.index < this.filteredTrees.length - 1){
                const conllNext = Object.values(this.filteredTrees[this.index+1].conlls)[0]
                const urlNextSentence = conllNext.match(/sound_url = (.*?)\n/)
                if (urlNextSentence !== null){
                    return  urlNextSentence[1] == this.getSoundUrl()
                }
            }
            return false
        },
        addContext(){
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (this.hasNextSentence() && this.isNextSentenceToggled()){
                this.AddSecondesDisable = true
                this.addSecondesModel = '0'
                const conllNext = Object.values(this.filteredTrees[this.index+1].conlls)[0]
                this.setEndFromNextSentence(conllNext)
                this.getNextSentenceToken(conllNext)
            } else {
                this.audioEnd = this.audioTokens[this.audioTokens.length -1].end
            }
            if (this.hasPreviousSentence() && this.isPreviousSentenceToggled()){
                this.AddSecondesDisable = true 
                this.addSecondesModel = '0'
                const conllPrev = Object.values(this.filteredTrees[this.index-1].conlls)[0]
                this.setBeginFromPreviousSentence(conllPrev)
                this.getPreviousSentenceToken(conllPrev)
            } else {
                this.audioBegin = this.audioTokens[0].begin 
            }
            audioPlayer.currentTime = this.audioBegin
            audioPlayer.pause()
            if (!this.isNextSentenceToggled() && !this.isPreviousSentenceToggled()){
                this.AddSecondesDisable = false
            }
        },
        setBeginFromPreviousSentence(conll: string){
            const begins = [...conll.matchAll(/AlignBegin=(\d+)(?:\||\n|$)/g)]
            this.audioBegin = Number(begins[0][1])/1000
        },
        setEndFromNextSentence(conll : string){
            const ends = [...conll.matchAll(/AlignEnd=(\d+)(?:\||\n|$)/g)]
            this.audioEnd = Number(ends[ends.length - 1][1])/1000
        },
        getNextSentenceToken(conll: string){
            const res = [...conll.matchAll(
            /^\d+\t([^\t]+)(?:\t[^\t]*){7}\t.*?AlignBegin=(\d+)\|AlignEnd=(\d+)/gm)]
            this.audioTokensNext = Object.values(res).map(m => ({
                begin: Number(m[2])/1000,
                word : m[1],
                end : Number(m[3])/1000,
            }))
            this.spansNext = this.audioTokensNext.map((token) => ({
                    text: " "+token.word,
                    begin: Number(token.begin),
                    class: " ",
                }
            ))
        },
        getPreviousSentenceToken(conll: string){
            const res = [...conll.matchAll(
            /^\d+\t([^\t]+)(?:\t[^\t]*){7}\t.*?AlignBegin=(\d+)\|AlignEnd=(\d+)/gm)]
            this.audioTokensPrev = Object.values(res).map(m => ({
                begin: Number(m[2])/1000,
                word : m[1],
                end : Number(m[3])/1000,
            }))
            this.spansPrev = this.audioTokensPrev.map((token) => ({
                    text: " "+token.word,
                    begin: Number(token.begin),
                    class: " ",
                }
            ))
        },
    }
})
</script>

<style lang="css">
.speaking{
    background-color: yellow;
}
.audio{
    width: 30%;
}
</style>