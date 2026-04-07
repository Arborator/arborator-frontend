<template>
  <div
    v-show="!isVideoHidden"
    ref="videoDiv"
    class="fixed z-max videoSize"
    :style="{ top: y + 'px', left: x + 'px' }"
  >

    <q-card
    @mousedown="startDrag"
    @mouseup="stopDrag"
    >
      <q-bar class="drag-handle bg-primary text-white" >
       <q-btn
       icon="speed"
       flat
       @click="showSpeedBtn = !showSpeedBtn"
       />
        <q-btn-toggle
          v-show="showSpeedBtn"
          v-model="videoSpeed"
          flat
          no-caps
          toggle-color="black"
          :options="[
            {label: 'x0.25', value: '0.25', slot: 'zero'},
            {label: 'x0.5', value: '0.5', slot: 'three'},
            {label: 'x1', value: '1', slot:'five'},
            {label: 'x1.5', value: '1.5', slot:'five'},
          ]"
          @update:model-value="changeVideoSpeed()"
        />

        <q-space />
        <q-btn dense flat icon="close" @click="toggleVideo()"/>
      </q-bar>

      <video
        ref="video"
        :src="cachedVideoUrl"
        controls
        preload="auto"
        class="video"
        @play="changeVideoSpeed()"
        :playbackRate="Number(videoSpeed)"
        disablePictureInPicture
      >
      </video>

    </q-card>
  </div>

  <div class="fixed-bottom-right q-pa-md z-max">
    <q-btn
      class="float-right"
      color="primary : purple-7"
      no-caps
      @click="toggleVideo()"
    >
      {{ hideText }}
    </q-btn>
  </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { mapState, mapWritableState } from 'pinia';
import { useTreesStore } from 'src/pinia/modules/trees';
import { useVideoStore } from 'src/pinia/modules/video';

export default defineComponent({
  name: "Video",
  props: {
    videoUrl: {
      type : String ,
      required : false,
    },
    grewSearch: {
      type : Boolean  ,
      required : false,
    }
  },
  data() {
    return {
      hideText: 'Hide video',
      isVideoHidden: false,
      x: 20,
      y: 100,
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      options: ['0.25', '0.5', '1', '1.5', '2'],
      cachedVideoUrl: '',
      videoSpeed: '1',
      showSpeedBtn: true
    }
  },
  computed: {
    ...mapState(useTreesStore, ["filteredTrees"] ),
    ...mapWritableState(useVideoStore, ["videoRef", "videoInGrewSearch"]),
  },
  mounted(){
    this.videoRef = this.$refs.video as HTMLVideoElement
    this.setVideoPosition()
    this.videoInGrewSearch = this.grewSearch === true
    this.cachedVideoUrl = this.getVideoUrl()
  },
  methods: {
    toggleVideo(){
      this.isVideoHidden = !this.isVideoHidden
      this.hideText = this.isVideoHidden ? "Show video" : "Hide video"
    },
    extractVideoUrlFromConll(conll: string): string {
      const match = conll.match(/video_url = (.*?)\n/)
      return match ? match[1] : ''
    },
    getVideoUrl(){
      if (!this.videoUrl){
        //search for video_url in CoNLL if this.videoUrl isn't given
        const conll = Object.values(this.filteredTrees[0].conlls)[0]
        return this.extractVideoUrlFromConll(conll)
      }
      return this.videoUrl.toString()
    },
    moveDiv(e : MouseEvent) {
      if (!this.dragging) return
      //set new position to mouse position
      this.x = e.clientX - this.offsetX
      this.y = e.clientY - this.offsetY
    },
    startDrag(e: MouseEvent) {
      this.dragging = true
      //calcul distance between div and mouse
      this.offsetX = e.clientX - this.x
      this.offsetY = e.clientY - this.y
      window.addEventListener('mousemove', this.moveDiv.bind(this))
    },
    stopDrag() {
      this.dragging = false
      window.removeEventListener('mousemove', this.moveDiv.bind(this))
    },
    changeVideoSpeed(){
      if (this.videoRef){
        this.videoRef.playbackRate = Number(this.videoSpeed)
        console.log("speed = ", this.videoSpeed)
      }
    },
    setVideoPosition(){
      //set video position to 70% of window's width
      this.x = window.innerWidth * 0.7
    },
  }
})
</script>
<style lang="css">
.videoSize{
  width: 25%;
  height:auto;
  text-align: center;
  resize: horizontal;
  overflow: auto;
  min-width: 100px;
}
.video{
  width: 100%;
  height: auto;
}
</style>
