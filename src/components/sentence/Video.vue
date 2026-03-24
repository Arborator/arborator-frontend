<template>
  <div
  v-if="!isVideoHidden"
  ref="videoDiv"
  class="fixed z-max videoSize"
  :style="{ top: y + 'px', left: x + 'px' }"
  >

    <q-card
    @mousedown="startDrag"
    @mouseup="stopDrag">
      <q-bar class="drag-handle bg-primary text-white " >
        <q-space />
        <q-btn dense flat icon="close" @click="hide()"/>
      </q-bar>

      <video
        ref = "video"
        :src="videoUrl"
        controls
        class="video"
        @play="changeVideoSpeed()"
      >
      </video>

      <div class="SpeedChoice" >
        <q-select
        color="primary : purple-7"
        v-model="model"
        :options="options"
        label="video Speed"
        @update:model-value="changeVideoSpeed()
        ">
        <template v-slot:prepend>
          <q-icon name="speed"/>
        </template>
        </q-select>
      </div>
    </q-card>
  </div>

  <div class="fixed-bottom-right q-pa-md z-max">
    <q-slider
    v-model="sliderValue"
    :min="1"
    :max="3"
    :step="0.1"
    @update:model-value="resizeDiv()"
    ></q-slider>
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
      videoUrl: '',
      x: ref(20),
      y: ref(100),
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      model: ref("1"),
      options: [
        '0.25', '0.5', '1', '1.5', '2'
      ],
      sliderValue: ref(1)
    }
  },
  computed: {
    ...mapState(useTreesStore, ["filteredTrees"] ),
    ...mapWritableState(useVideoStore, ["videoRef"]),
  },
  mounted(){
    this.videoRef = this.$refs.video as HTMLVideoElement
    this.videoUrl = this.getVideoUrl()
    this.x = 1100
  },
  methods: {
    changeHiddenValue(){
      this.isVideoHidden = !this.isVideoHidden
    },
    hide(){
      this.changeHiddenValue()
      if(this.isVideoHidden){
        this.hideText = "Show video"
      }else{
        this.hideText = "Hide video"
      }
    },
    getVideoUrl(){
      const conll = Object.values(this.filteredTrees[0].conlls)[0]
      const videoUrl= conll.match(/video_url = (.*?)\n/)
      if (videoUrl){
        return videoUrl[1]
      }
      return ''
    },
    moveDiv(e : MouseEvent){
      if (!this.dragging) return
      this.x = e.clientX - this.offsetX
      this.y = e.clientY - this.offsetY
    },
    startDrag(e: MouseEvent) {
      this.dragging = true;
      this.offsetX = e.clientX - this.x
      this.offsetY = e.clientY - this.y
      window.addEventListener('mousemove', this.moveDiv)
    },
    stopDrag() {
      this.dragging = false;
      window.removeEventListener('mousemove', this.moveDiv)
    },
    changeVideoSpeed(){
      if (this.videoRef){
        this.videoRef.playbackRate = Number(this.model)
      }
    },
    resizeDiv(){
      const videoDiv = this.$refs.videoDiv as HTMLDivElement
      const width = 500*this.sliderValue + "px"
      videoDiv.style.maxWidth = width
      console.log(width)
    }
  }
})
</script>
<style lang="css">
.videoSize{
  max-width: 500px;
  max-height:350px;
  text-align: center;
}
.video{
  width: 100%;
  height: auto;
}
.backgroundBtn{
  background-color: "gray";
}
.speedChoice{
  height: auto;
  width: 150px;
}
</style>
