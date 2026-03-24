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
        v-if="isNextSentenceToggled() && hasNextSentence()"
        v-for="item in spansNext"
        :class="item.class + ' cursor-pointer'"
        @click="clickWord(item.begin)"
        @dblclick="dblClickWord"
    >
        {{ item.text }}
    </span>
  </div>

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
    }
  },
  computed: {
    ...mapState(useTreesStore, ["filteredTrees"] ),
    ...mapState(useVideoStore, ['videoRef']),
  },
  mounted(){
    this.videoTokens = this.getVideoTokens()
    if (this.hasToken()){
      this.videoEnd = this.videoTokens[this.videoTokens.length -1].end
      this.videoBegin = this.videoTokens[0].begin
      this.setText()
    }
    this.videoInit()
    //add eventListeners to video
    this.videoRef?.addEventListener("play", this.videoPlay)
    this.videoRef?.addEventListener("pause", this.videoPause)
    this.videoRef?.addEventListener("seeking", this.videoSeeking)
  },
  unmounted(){
    //remove eventListener when component is unmounted
    this.videoRef?.removeEventListener("play", this.videoPlay)
    this.videoRef?.removeEventListener("pause", this.videoPause)
    this.videoRef?.removeEventListener("seeking", this.videoSeeking)
  },
  methods: {
    ...mapActions(useVideoStore, ['pause', 'play', 'setTime']),
    getUserId(){
      const id = Object.entries(this.reactiveSentencesObj)[0][0]
      if (id !== undefined){
        return id
      }
      return '';
    },
    getVideoUrl() {
      const videoUrl = this.reactiveSentencesObj[this.getUserId()].state.metaJson.sound_url
      if (videoUrl !== null){
        return videoUrl.toString()
      }
      return '';
    },
    getVideoTokens() {
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
    videoInit() {
      if (this.videoRef != undefined) {
        this.videoRef.currentTime = this.videoBegin
      }
    },
    videoPlay(){
    if (this.videoRef !== null) this.videoRef.playbackRate = 0.2
      if (this.hasToken()){
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
      pos === null ? pos = [0]: pos = pos;
      return pos;
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
      if (this.videoRef){
        let SecondsToAdd = 0
        let SecondsToRetrieve = 0
        let timeBeforeEnd = this.videoRef.duration - this.videoTokens[this.videoTokens.length -1].end
        switch(this.addSecondsModel){
          case "Three" : {
            this.videoTokens[0].begin >= 3 ? SecondsToRetrieve = 3 : SecondsToRetrieve = this.videoTokens[0].begin
            timeBeforeEnd >= 3 ? SecondsToAdd = 3 : SecondsToAdd = timeBeforeEnd
          }; break;
          case "Five" : {
            this.videoTokens[0].begin >= 5 ? SecondsToRetrieve = 5 : SecondsToRetrieve = this.videoTokens[0].begin
            timeBeforeEnd >= 5 ? SecondsToAdd = 5 : SecondsToAdd = timeBeforeEnd
          }; break;
          default : break;
        }
        this.videoBegin = this.videoTokens[0].begin - SecondsToRetrieve
        this.videoEnd = this.videoTokens[this.videoTokens.length -1].end + SecondsToAdd
        this.videoRef.currentTime = this.videoBegin
      }
    },
    isNextSentenceToggled(){
      return this.toggleNext
    },
    isPreviousSentenceToggled(){
      return this.togglePrevious
    },
    hasPreviousSentence(){
      return this.index >= 1
    },
    hasNextSentence(){
      return this.index < (this.filteredTrees.length - 1)
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
      this.videoBegin = Number(begins[0][1])/1000
    },
    setEndFromNextSentence(conll : string){
      const ends = [...conll.matchAll(/AlignEnd=(\d+)(?:\||\n|$)/g)]
      this.videoEnd = Number(ends[ends.length - 1][1])/1000
    },
    setNextSentenceToken(conll: string){
      const res = [...conll.matchAll(
      /^\d+\t([^\t]+)(?:\t[^\t]*){7}\t.*?AlignBegin=(\d+)\|AlignEnd=(\d+)/gm)]
      this.videoTokensNext = Object.values(res).map(m => ({
        begin: Number(m[2])/1000,
        word : m[1],
        end : Number(m[3])/1000,
      }))
    },
    setPreviousSentenceToken(conll: string){
      const res = [...conll.matchAll(
      /^\d+\t([^\t]+)(?:\t[^\t]*){7}\t.*?AlignBegin=(\d+)\|AlignEnd=(\d+)/gm)]
      this.videoTokensPrev = Object.values(res).map(m => ({
        begin: Number(m[2])/1000,
        word : m[1],
        end : Number(m[3])/1000,
      }))
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
  }
})
</script>

<style lang="css">
.speaking{
  background-color: yellow;
}
</style>

