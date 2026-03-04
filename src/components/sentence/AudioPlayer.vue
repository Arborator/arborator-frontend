<template>

     <audio ref="audioPlayer" :src="currentUrl" @play="audioPlay" @pause="audioPause"
      @seeking="audioSeeking" controls
      style="margin: 0.5%; width: 30%;">
      </audio>

</template>

<script lang="ts">
import { mapState } from 'pinia';
import { useTreesStore } from 'src/pinia/modules/trees';
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
         audioTokens: [{dataset:{begin: 0, end: 0, dur: 0 }}],
         audioBegin: 0,
         audioEnd : 0,
         audio_interval_id: setInterval(this.update(), 50),
         audio_speaking_index: 1,
        }
    },
    computed: {
        ...mapState(useTreesStore, ["userIds"])
    },
    mounted(){
            this.conllData = this.getConllData() 
            this.currentUrl = this.getSoundUrlConll()
            this.audioTokens= this.getAudioTokens()
            if (this.audioTokens[this.audioTokens.length -1] != undefined){
                this.audioEnd = this.audioTokens[this.audioTokens.length -1].dataset.end
                this.audioBegin = this.audioTokens[0].dataset.begin
                //console.log(this.audioTokens, "fin : ", this.audioEnd)
            }
            clearInterval(this.audio_interval_id)
            this.$nextTick(() => {
               const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
               audioPlayer.currentTime = this.audioBegin
               this.audioInit()
            })
    },
    methods: {
        getConllData(){
            const [conllData]  = Object.values(this.sentenceData.conlls)
            return conllData
        },
        getMeta(){
            const meta = this.reactiveSentencesObj[this.getUserId()].state.metaJson
            return meta
        },
        getUserId(){
            const id = Object.entries(this.reactiveSentencesObj)[0][0]
            if (id !== undefined){
                 return id
            }
            return '';    
        },
        getSoundUrlConll() {
            const soundUrl = this.conllData.match(/sound_url = (.*?)\n/)
            if (soundUrl !== null){
                //return this.getMeta().sound_url.toString()
                return soundUrl[1]
            }
            return "";
        },
        getAudioTokens(){
            const regex = /AlignBegin=(\d+)\|AlignEnd=(\d+)(?:\||\n|$)/g
            const matches = [...this.conllData.matchAll(regex)];

            return matches.map(m => {
                const begin = parseFloat(m[1]);
                const end = parseFloat(m[2]);
                return {
                    dataset: {
                        begin: begin/1000,
                        end : end/1000,
                        dur: (end - begin)/1000
                    }
                };
            });
        },
        async audioInit() {
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (!audioPlayer) return

            if (audioPlayer.readyState < 1) {
                await new Promise<void>((resolve) => {
                audioPlayer.addEventListener('loadedmetadata', () => resolve(), { once: true })
                })
            }
            //audio.currentTime = this.audioBegin
            audioPlayer.pause()
        },
        audioPlay(){
            console.log ("play")
            if (this.audioTokens != undefined && this.audioTokens.length > 0){
                this.audio_interval_id = setInterval(() => {
                    this.update()
                }, 50)
            }
        },
        update(){
            //on met pause quand nécéssaire
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer != undefined){
                if (audioPlayer.currentTime >= this.audioEnd){
                    audioPlayer.pause()
                } else {                    
                    let token_data = this.audioTokens[this.audio_speaking_index].dataset
                    let token_end = Number(token_data.begin) + Number(token_data.dur)
                    if (audioPlayer.currentTime > token_end) {
                        //color text
                        this.speakingToken(this.audio_speaking_index + 1)
                    }
                }
            }else{
                console.log("audioPlayer undefined dans update")
            }
        },
        audioPause(){
            //clear l'interval et on remet au debut si fin durée
            console.log("pause")
            const audio = this.$refs.audioPlayer as HTMLAudioElement
            if (audio != undefined){
                if (this.audioTokens != undefined && this.audioTokens.length > 0){
                    if (this.audio_interval_id){
                        clearInterval(this.audio_interval_id)
                    }
                    if (audio.currentTime >= this.audioEnd) {
                        audio.currentTime = this.audioBegin
                    }
                }else{
                    console.log("audiotoken est undefined dans pause")
                }
            }  
        },

        audioSeeking(){
            //console.log("seeking")
            const audioPlayer = this.$refs.audioPlayer as HTMLAudioElement
            if (audioPlayer != null){
                if (this.audioTokens != undefined && this.audioTokens.length > 0) {
                    let pos = 0
                    this.audioTokens.forEach (function (node,index) {
                        //node.classList.remove('speaking')
                        let begin = Number(node.dataset.begin)
                        let end = begin + Number(node.dataset.dur)
                        if (audioPlayer.currentTime >= begin && audioPlayer.currentTime <= end) {
                            pos = index
                        }
                    })
                    //on met la coleur sur le bon mot
                    this.speakingToken(pos)
                }
            } else{
                console.log("audioplayer null dans seeking")
            }
        },
        speakingToken(position : number){
            let prev_word = this.audioTokens[this.audio_speaking_index]
            //prev_word.classList.remove('speaking')
            let new_word = this.audioTokens[position]
            this.audio_speaking_index = position
            //new_word.classList.add('speaking')
        }
    }
})


</script>