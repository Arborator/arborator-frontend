<template>
  <div class="q-ml-lg">
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
        v-if="isNextSentenceToggled() && hasNextSentence() "
        v-for="item in spansNext"
        :class="item.class + ' cursor-pointer'"
        @click="clickWord(item.begin)"
        @dblclick="dblClickWord"
    >
        {{ item.text }}
    </span>
  </div>

      <q-toggle
        v-if="hasToken() && hasPreviousSentence() && !isInFiltre()"
        v-model="togglePrevious"
        color="primary: purple-7"
        label="previous sentence"
        left-label
        @update:model-value="addContext()"
      />
      <q-toggle
        v-if="hasToken() && hasNextSentence() && !isInFiltre()"
        v-model="toggleNext"
        color="primary : purple-7"
        label="next sentence"
        left-label
        @update:model-value="addContext()"
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
        @update:model-value="addSeconds()"
      >
        <q-tooltip v-if="AddSecondsDisable">
          can't be used with next or previous sentence toggled
        </q-tooltip>

        <template v-slot:zero v-if="!AddSecondsDisable">
            <q-tooltip>
              video will <strong>start 0s earlier</strong> and <strong>end 0s later</strong>
            </q-tooltip>
        </template>

        <template v-slot:three v-if="!AddSecondsDisable">
          <q-tooltip>
            video will <strong>start 3s earlier</strong> and <strong>end 3s later</strong>
          </q-tooltip>
        </template>

        <template v-slot:five v-if="!AddSecondsDisable">
          <q-tooltip>
            video will <strong>start 5s earlier</strong> and <strong>end 5s later</strong>
          </q-tooltip>
        </template>

      </q-btn-toggle>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, ref, watch } from 'vue';
import { reactive_sentences_obj_t } from 'src/types/main_types';

import { mapState, mapActions } from 'pinia';
import { useTreesStore } from 'src/pinia/modules/trees';
import { useVideoStore } from 'src/pinia/modules/video';

export default defineComponent({
  name: "VideoBtn",
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
      videoTokens: [] as { begin: number; end: number; word: string; }[],
      videoBegin: 0,
      videoEnd : 0,
      videoSpeakingIndex: 0,
      videoSpeakingTabIndex: [] as number[],
      videoIntervalId: null as any,
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
      videoTokensNext: [] as { begin: number; end: number; word: string; }[],
      spansPrev: [] as Array<{
        text: string
        begin: number
        class: string
      }>,
      videoTokensPrev: [] as { begin: number; end: number; word: string; }[],
      currentSentence: 'current',
      cachedUserId: ''
    }
  },
  computed: {
    ...mapState(useTreesStore, ['trees', 'filteredTrees']),
    ...mapState(useVideoStore, ['videoRef']),
  },
  mounted(){
    this.videoTokens = this.getVideoTokens()
    if (this.hasToken()){
      this.videoEnd = this.videoTokens[this.videoTokens.length -1].end
      this.videoBegin = this.videoTokens[0].begin
      this.setText()
      this.cachedUserId = this.getUserId()
    }
    this.videoInit()
    //add eventListeners to video
    this.videoRef?.addEventListener("play", this.videoPlay)
    this.videoRef?.addEventListener("pause", this.videoPause)
    this.videoRef?.addEventListener("seeking", this.videoSeeking)
  },
  beforeUnmount(){
    this.videoPause()
    //remove eventListener before component is unmounted
    this.videoRef?.removeEventListener("play", this.videoPlay)
    this.videoRef?.removeEventListener("pause", this.videoPause)
    this.videoRef?.removeEventListener("seeking", this.videoSeeking)
  },
  methods: {
    ...mapActions(useVideoStore, ['pause', 'play', 'setTime']),
    getUserId(){
      const id = Object.entries(this.reactiveSentencesObj)[0][0]
      return id !== undefined ? id : ''
    },
    getVideoUrl() {
      const userId = this.cachedUserId || this.getUserId()
      const videoUrl = this.reactiveSentencesObj[userId].state.metaJson.sound_url
      return videoUrl ? videoUrl.toString() : '';
    },
    getVideoTokens() {
      const userId = this.cachedUserId || this.getUserId()
      const form = this.reactiveSentencesObj[userId].state.treeJson.nodesJson
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
    videoInit() {
      if (this.videoRef != undefined) {
        this.videoRef.currentTime = this.videoBegin
        this.videoRef.pause()
      }
    },
    videoPlay(){
    if (this.videoRef !== null)
      if (this.videoRef && this.hasToken()){
        this.videoIntervalId = setInterval(() => {
          this.update()
        }, 50)
      }
    },
    update(){
      if (this.videoRef !== null){
        if (this.videoRef.currentTime >= this.videoEnd || this.videoRef.currentTime < this.videoBegin){
          this.videoRef.pause()
        }
        this.videoSeeking()
      }
    },
    removeLastSentenceSpeakingClass() {
      //remove highlight class on previous words when changing sentence
      switch(this.currentSentence){
        case "prev" :this.videoSpeakingTabIndex.forEach(speakingIndex => {
          if (this.spansPrev[speakingIndex]) this.spansPrev[speakingIndex].class = "";
        }); break;
        case "current" : this.videoSpeakingTabIndex.forEach(speakingIndex => {
          if (this.spans[speakingIndex]) this.spans[speakingIndex].class = "";
        }); break;
        case "next" : this.videoSpeakingTabIndex.forEach(speakingIndex => {
          if (this.spansNext[speakingIndex]) this.spansNext[speakingIndex].class = "";
        }); break;
      }
    },
    getSpeakingSentenceInfo() {
      //get corresponding span,sentence and tokenData (previous, current or next Sentence)
      let token = this.videoTokens
      let span = this.spans
      let sentence = "current"
      if (this.videoRef){
        if(this.videoRef.currentTime < this.videoTokens[0].begin){
          token = this.videoTokensPrev
          span = this.spansPrev
          sentence = "prev"
        } else if (this.videoRef.currentTime > this.videoTokens[this.videoTokens.length - 1].end){
          token = this.videoTokensNext
          span = this.spansNext
          sentence = "next"
        }
      }
      return {span, token, sentence}
    },
    changeSentence(sentence : string) {
      this.removeLastSentenceSpeakingClass()
      this.currentSentence = sentence
    },
    videoPause() {
      if (this.videoRef != undefined && this.hasToken()){
        if (this.videoIntervalId){
          clearInterval(this.videoIntervalId)
        }
        if (this.videoRef.currentTime >= this.videoEnd || this.videoRef.currentTime < this.videoBegin) {
          this.videoRef.currentTime = this.videoBegin
        }
      }
    },
    videoSeeking() {
      if (this.videoRef != null && this.hasToken()){
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
    getSpeakingTokenIndex(tokens : {begin:number, end:number, word:string}[]) {
      let pos = [] as number[]
      if (this.videoRef){
        const currentTime = this.videoRef?.currentTime
        tokens.forEach (function (node,index) {
          let begin = node.begin
          let end =  node.end
          if (currentTime >= begin && currentTime < end) {
            pos.push(index)
          }
        })
      }
      return pos === null ? [0]: pos ;
    },
    speakingToken(position : number[], spans : Array<{text: string;begin: number;class: string; }>) {
      this.videoSpeakingTabIndex.forEach((index) =>{
        let prevWord = spans[index]
        if (prevWord){
          prevWord.class = " ";
        }
      })
      position.forEach((pos) => {
        let newWord = spans[pos]
        if (newWord){
          newWord.class = "speaking"
        }
      })
      this.videoSpeakingTabIndex = position
    },
    setText() {
      if (this.hasToken()) {
        this.spans = this.videoTokens.map((node) => ({
          text: " " + node.word,
          begin: Number(node.begin),
          class: ""
        }))
      }
    },
    clickWord(begin : number | undefined) {
      if (begin && this.videoRef){
        this.videoRef.currentTime = begin
      }
    },
    dblClickWord() {
      if (this.videoRef){
        this.videoRef.play()
      }
    },
    hasToken(){
      return (this.getVideoTokens() != undefined && this.getVideoTokens().length > 0)
    },
    addSeconds(){
      const videoRef = this.videoRef as HTMLVideoElement
      const secondsToAdd = { 'Three': 3, 'Five': 5, '0': 0 }[this.addSecondsModel] || 0

      if (secondsToAdd === 0 || !videoRef) return

      const firstBegin = this.videoTokens[0].begin
      const lastEnd = this.videoTokens[this.videoTokens.length - 1].end
      const timeBeforeEnd = videoRef.duration - lastEnd

      const SecondsToRetrieve = Math.min(secondsToAdd, firstBegin)
      const SecondsToAdd = Math.min(secondsToAdd, timeBeforeEnd)

      this.videoBegin = firstBegin - SecondsToRetrieve
      this.videoEnd = lastEnd + SecondsToAdd
      videoRef.currentTime = this.videoBegin
    },
    isNextSentenceToggled(){
      return this.toggleNext
    },
    isPreviousSentenceToggled(){
      return this.togglePrevious
    },
    hasPreviousSentence(){
      return this.index >= 1 && Object.values(this.trees)[this.index-1]
    },
    hasNextSentence(){
      if (Object.values(this.trees).length - 1){
        return this.index < (Object.values(this.trees).length - 1)
      }
    },

    addContext(){
      if (this.videoRef){
        if (this.hasNextSentence() && this.isNextSentenceToggled()){
          this.addNextSentence()
        } else {
          this.videoEnd = this.videoTokens[this.videoTokens.length -1].end
        }
        if (this.hasPreviousSentence() && this.isPreviousSentenceToggled()){
          this.addPreviousSentence()
        } else {
          this.videoBegin = this.videoTokens[0].begin
        }
        this.videoRef.currentTime = this.videoBegin
        this.pause()
        if (!this.isNextSentenceToggled() && !this.isPreviousSentenceToggled()){
          this.AddSecondsDisable = false
        }
      }
    },
    addNextSentence(){
      this.AddSecondsDisable = true
      this.addSecondsModel = '0'
      const conllNext = Object.values(Object.values(this.trees)[this.index+1].conlls)[0]
      this.setEndFromNextSentence(conllNext)
      this.setNextSentenceToken(conllNext)
      this.setNextSentenceText()
    },
    addPreviousSentence(){
      this.AddSecondsDisable = true
      this.addSecondsModel = '0'
      const conllPrev = Object.values(Object.values(this.trees)[this.index-1].conlls)[0]
      this.setBeginFromPreviousSentence(conllPrev)
      this.setPreviousSentenceToken(conllPrev)
      this.setPreviousSentenceText()
    },
    setBeginFromPreviousSentence(conll: string){
      const begins = [...conll.matchAll(/AlignBegin=(\d+)(?:\||\n|$)/g)]
      this.videoBegin = Number(begins[0][1])/1000
    },
    setEndFromNextSentence(conll : string){
      const ends = [...conll.matchAll(/AlignEnd=(\d+)(?:\||\n|$)/g)]
      this.videoEnd = Number(ends[ends.length - 1][1])/1000
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
      this.videoTokensNext = this.PrevNextFromConll(conll)
    },
    setPreviousSentenceToken(conll: string){
      this.videoTokensPrev = this.PrevNextFromConll(conll)
    },
    setPreviousSentenceText(){
      this.spansPrev = this.videoTokensPrev.map((token) => ({
        text: " "+token.word,
        begin: Number(token.begin),
        class: " ",
      }))
    },
    setNextSentenceText(){
      this.spansNext = this.videoTokensNext.map((token) => ({
        text: " "+token.word,
        begin: Number(token.begin),
        class: " ",
      }))
    },
    isInFiltre(){
      return Object.values(this.trees).length !== this.filteredTrees.length
    },
  }
})
</script>

<style lang="css">
.speaking{
  background-color: yellow;
}
</style>

