<template>


    <div ref="videoDiv" class="q-pa-md fixed-right z-max q-mt-md q-pt-xl videoSize">
      <video
        ref = "video"
        src="https://github.com/RomainSabat/testTreebank/raw/refs/heads/main/1A-OC.mp4"
        ratio="16/9"
        controls
        style="width: 100%; height: auto;"
        class="q-mt-lg"
        draggable="true"
      ></video>
    </div>


  <div class="fixed-bottom-right q-pa-md z-max ">
    <q-btn
      class="float-right"
      color="primary : purle-7"
      no-caps
      v-on:click="hide()"
    >
      {{ hideText }}
    </q-btn>
    </div>

</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { mapState, mapWritableState } from 'pinia';
import { useTreesStore } from 'src/pinia/modules/trees';
import { useVideoStore } from 'src/pinia/modules/video';

export default defineComponent({
  name: "Video",
  data() {
    return {
      video: null as HTMLVideoElement | null,
      videoTokens: [] as { begin: number; end: number; word: string; }[],
      videoBegin: 0,
      videoEnd : 0,
      videoSpeakingIndex: 0,
      hideText:'Hide video',
      isVideoHidden: false,
    }
  },
  computed: {
    ...mapState(useTreesStore, ["filteredTrees"] ),
    ...mapWritableState(useVideoStore, ["videoRef"]),
  },
  mounted(){
    this.videoRef = this.$refs.video as HTMLVideoElement
  },
  methods: {
    changeHiddenValue(){
      this.isVideoHidden = !this.isVideoHidden
    },
    hide(){
      const videoDiv = this.$refs.videoDiv as HTMLDivElement
      const div = this.$refs.DIV as HTMLDivElement
      if(videoDiv.classList.contains('invisible')){
        videoDiv.classList.remove('invisible')
        this.hideText = "Hide video"
      }else{
        videoDiv.classList.add('invisible')
        this.hideText = "Show video"
      }
    },
    setVideoTimeCode(timdeCode : number){
      const video = this.$refs.video as HTMLVideoElement
      video.currentTime = timdeCode
    },
    getVideoTimeCode(){
      const video = this.$refs.video as HTMLVideoElement
      return video.currentTime
    },


  }
})
</script>
<style lang="css">
.videoSize{
  width: 500px;
  height:350px;
}
.backgroundBtn{
  background-color: "gray";
}

</style>
