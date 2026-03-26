<template>
  <div v-if="hasToken()" class="q-ma-xs">
    <span
      v-if="isPreviousSentenceToggled() && hasPreviousSentence()"
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
    <span
      v-if="isNextSentenceToggled() && hasNextSentence()"
      v-for="item in spansNext"
      :class="item.class + ' cursor-pointer'"
      @click="clickWord(item.begin)"
      @dblclick="dblClickWord"
    >
        {{ item.text }}
    </span>
  </div>

  <div class="row">
    <audio
      ref="audioPlayer"
      preload="auto"
      :src="currentUrl"
      @play="audioPlay"
      @pause="audioPause"
      @seeking="audioSeeking"
      controls
      controlsList="nodownload"
      class="q-ma-xs col-4"
    ></audio>

    <div class="q-ml-lg col">
      <q-toggle
          v-if="hasToken() && hasPreviousSentence()"
          v-model="togglePrevious"
          color="primary: purple-7"
          label="previous sentence"
          left-label
          @update:model-value="addContext();"
      />
      <q-toggle
        v-if="hasToken() && hasNextSentence()"
        v-model="toggleNext"
        color="primary : purple-7"
        label="next sentence"
        left-label
        @update:model-value="addContext();"
      />
      <q-btn-toggle
        v-if="hasToken()"
        v-model="addSecondsModel"
        push
        glossy
        toggle-color="primary : purple-7"
        no-caps
        :disable="AddSecondsDisable"
        :options="[
          {label: '+0s', value: '0', slot: 'zero'},
          {label: '+3s', value: 'Three', slot: 'three'},
          {label: '+5s', value: 'Five', slot:'five'},
        ]"
        @update:model-value="addSeconds();"
      >
        <q-tooltip v-if="AddSecondsDisable">
          can't be used while next or previous sentence is toggled
        </q-tooltip>

        <template v-slot:zero v-if="!AddSecondsDisable">
          <q-tooltip>
            audio will <strong>start 0s earlier</strong> and <strong>end 0s later</strong>
          </q-tooltip>
        </template>

        <template v-slot:three v-if="!AddSecondsDisable">
          <q-tooltip>
            audio will <strong>start 3s earlier</strong> and <strong>end 3s later</strong>
          </q-tooltip>
        </template>

        <template v-slot:five v-if="!AddSecondsDisable">
          <q-tooltip>
            audio will <strong>start 5s earlier</strong> and <strong>end 5s later</strong>
          </q-tooltip>
        </template>

      </q-btn-toggle>

    </div>
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
      audioBegin: 0, //timeCode begining of sentence
      audioEnd : 0, //timeCode end of sentence
      audioIntervalId: null as any,
      audioSpeakingIndex: 0,
      spans: [] as Array<{
        text: string
        begin: number
        class: string
      }>,
      addSecondsModel: ref('0'),
      AddSecondsDisable: false,
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
      currentSentence: 'current',
      cachedUserId: ''
    }
  },
  computed: {
    ...mapState(useTreesStore, ["filteredTrees"] ),
  },
  mounted(){
    this.cachedUserId = this.getUserId()
    this.currentUrl = this.getSoundUrl()
    this.audioTokens = this.getAudioTokens()
    if (this.hasToken()){
      this.audioEnd = this.audioTokens[this.audioTokens.length -1].end
      this.audioBegin = this.audioTokens[0].begin
      this.setText()
    }
    this.audioInit()
  },
  methods: {
    getUserId(){
      const id = Object.entries(this.reactiveSentencesObj)[0][0]
      return id !== undefined ? id : ''
    },
    getSoundUrl() {
      const userId = this.cachedUserId || this.getUserId()
      const soundUrl = this.reactiveSentencesObj[userId].state.metaJson.sound_url
      return soundUrl ? soundUrl.toString() : ''
    },
    getAudioTokens(){
      const userId = this.cachedUserId || this.getUserId()
      const form = this.reactiveSentencesObj[userId].state.treeJson.nodesJson
      if (form[1]?.MISC?.AlignBegin && form[1]?.MISC?.AlignEnd){
        return Object.values(form).map((token) =>({
          begin : Number(token.MISC.AlignBegin)/1000,
          end : Number(token.MISC.AlignEnd)/1000,
          word : token.FORM
        }))
      }
      return []
    },
    audioInit() {
      const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
      if (audioPlayer != undefined) {
        audioPlayer.currentTime = this.audioBegin
      }
    },
    audioPlay(){
      if (this.hasToken()){
        this.audioIntervalId = setInterval(() => this.update(), 50)
      }
    },
    update(){
      const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
      if (audioPlayer != undefined){
        //get informations about speaking sentence
        const sentenceInfo = this.getSpeakingSentenceInfo()
        const span = sentenceInfo.span
        const token_data = sentenceInfo.token[this.audioSpeakingIndex]
        const sentence = sentenceInfo.sentence
        if(sentence !== this.currentSentence){
          this.changeSentence(sentence)
          this.audioSpeakingIndex = 0
        }

        if (audioPlayer.currentTime >= this.audioEnd || audioPlayer.currentTime < this.audioBegin){
          audioPlayer.pause()
        } else if (token_data){
          let token_end = Number(token_data.end)
          //color next token
          if (!token_end || audioPlayer.currentTime > token_end ) {
            this.speakingToken(this.audioSpeakingIndex + 1, span)
          } else if (this.audioSpeakingIndex === 0){
            this.speakingToken(this.audioSpeakingIndex , span)
          }
        }
      }
    },
    removeLastSentenceSpeakingClass(){
      //remove highlight class on previous word when changing sentence
      switch(this.currentSentence){
        case "prev" :if (this.spansPrev[this.audioSpeakingIndex]) this.spansPrev[this.audioSpeakingIndex].class = ""; break;
        case "current" : if (this.spans[this.audioSpeakingIndex]) this.spans[this.audioSpeakingIndex].class = ""; break;
        case "next" : if (this.spansNext[this.audioSpeakingIndex]) this.spansNext[this.audioSpeakingIndex].class = ""; break;
      }
    },
    getSpeakingSentenceInfo() {
      //get corresponding span,sentence and tokenData (previous, current or next Sentence)
      const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
      let token = this.audioTokens
      let span = this.spans
      let sentence = "current"
      if(audioPlayer.currentTime < this.audioTokens[0].begin){
        token = this.audioTokensPrev
        span = this.spansPrev
        sentence = "prev"
      } else if (audioPlayer.currentTime > this.audioTokens[this.audioTokens.length - 1].end){
        token = this.audioTokensNext
        span = this.spansNext
        sentence = "next"
      }
      return {span, token, sentence}
    },
    changeSentence(sentence : string){
      this.removeLastSentenceSpeakingClass()
      this.currentSentence = sentence
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

      if (audioPlayer != null && this.hasToken()){
        const sentenceInfo = this.getSpeakingSentenceInfo()
        const spans = sentenceInfo.span
        const tokens = sentenceInfo.token
        const sentence = sentenceInfo.sentence

        const pos = this.getSpeakingTokenIndex(tokens)
        if (sentence !== this.currentSentence){
          this.changeSentence(sentence);
        }
        this.speakingToken(pos, spans)
      }
    },
    getSpeakingTokenIndex(tokens : {begin:number, end:number, word:string}[]){
      const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
      const currentTime = audioPlayer.currentTime
      return tokens.findIndex(token => currentTime >= token.begin && currentTime <= token.end)
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
    clickWord(begin : number | undefined) {
      const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
      if (begin && audioPlayer){
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
    addSeconds(){
      const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
      const secondsToAdd = { 'Three': 3, 'Five': 5, '0': 0 }[this.addSecondsModel] || 0

      if (secondsToAdd === 0) return

      const firstBegin = this.audioTokens[0].begin
      const lastEnd = this.audioTokens[this.audioTokens.length - 1].end
      const timeBeforeEnd = audioPlayer.duration - lastEnd

      const SecondsToRetrieve = Math.min(secondsToAdd, firstBegin)
      const SecondsToAdd = Math.min(secondsToAdd, timeBeforeEnd)

      this.audioBegin = firstBegin - SecondsToRetrieve
      this.audioEnd = lastEnd + SecondsToAdd
      audioPlayer.currentTime = this.audioBegin
    },
    isNextSentenceToggled(){
      return this.toggleNext
    },
    isPreviousSentenceToggled(){
      return this.togglePrevious
    },
    extractSoundUrlFromConll(conll: string): string | null {
      const match = conll.match(/sound_url = (.*?)\n/)
      return match ? match[1] : null
    },
    hasPreviousSentence(){
      if (this.index >= 1) {
        const conllPrev = Object.values(this.filteredTrees[this.index-1].conlls)[0]
        const urlPreviousSentence = this.extractSoundUrlFromConll(conllPrev)
        return urlPreviousSentence === this.getSoundUrl()
      }
      return false
    },
    hasNextSentence(){
      if (this.index < this.filteredTrees.length - 1) {
        const conllNext = Object.values(this.filteredTrees[this.index+1].conlls)[0]
        const urlNextSentence = this.extractSoundUrlFromConll(conllNext)
        return urlNextSentence === this.getSoundUrl()
      }
      return false
    },
    addContext(){
      const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
      if (this.hasNextSentence() && this.isNextSentenceToggled()){
        this.addNextSentence()
      } else {
        this.audioEnd = this.audioTokens[this.audioTokens.length -1].end
      }
      if (this.hasPreviousSentence() && this.isPreviousSentenceToggled()){
        this.addPreviousSentence()
      } else {
        this.audioBegin = this.audioTokens[0].begin
      }
      audioPlayer.currentTime = this.audioBegin
      audioPlayer.pause()
      if (!this.isNextSentenceToggled() && !this.isPreviousSentenceToggled()){
        this.AddSecondsDisable = false
      }
    },
    addNextSentence(){
      this.AddSecondsDisable = true
      this.addSecondsModel = '0'
      const conllNext = Object.values(this.filteredTrees[this.index+1].conlls)[0]
      this.setEndFromNextSentence(conllNext)
      this.setNextSentenceToken(conllNext)
      this.setNextSentenceText()
    },
    addPreviousSentence(){
      this.AddSecondsDisable = true
      this.addSecondsModel = '0'
      const conllPrev = Object.values(this.filteredTrees[this.index-1].conlls)[0]
      this.setBeginFromPreviousSentence(conllPrev)
      this.setPreviousSentenceToken(conllPrev)
      this.setPreviousSentenceText()
    },
    setBeginFromPreviousSentence(conll: string){
      const begins = [...conll.matchAll(/AlignBegin=(\d+)(?:\||\n|$)/g)]
      this.audioBegin = Number(begins[0][1])/1000
    },
    setEndFromNextSentence(conll : string){
      const ends = [...conll.matchAll(/AlignEnd=(\d+)(?:\||\n|$)/g)]
      this.audioEnd = Number(ends[ends.length - 1][1])/1000
    },
    PrevNextFromConll(conll: string): { begin: number; end: number; word: string; }[] {
      const res = [...conll.matchAll(
        /^\d+\t([^\t]+)(?:\t[^\t]*){7}\t.*?AlignBegin=(\d+)\|AlignEnd=(\d+)/gm)]
      return res.map(m => ({
        begin: Number(m[2])/1000,
        word : m[1],
        end : Number(m[3])/1000,
      }))
    },
    setNextSentenceToken(conll: string){
      this.audioTokensNext = this.PrevNextFromConll(conll)
    },
    setPreviousSentenceToken(conll: string){
      this.audioTokensPrev = this.PrevNextFromConll(conll)
    },
    PrevNextSentence(tokens: { begin: number; end: number; word: string; }[]): Array<{text: string; begin: number; class: string}> {
      return tokens.map((token) => ({
        text: " " + token.word,
        begin: Number(token.begin),
        class: " ",
      }))
    },
    setPreviousSentenceText(){
      this.spansPrev = this.PrevNextSentence(this.audioTokensPrev)
    },
    setNextSentenceText(){
      this.spansNext = this.PrevNextSentence(this.audioTokensNext)
    },
  }
})
</script>

<style lang="css">
.speaking{
  background-color: yellow;
}
</style>
