<template>
  <div
    v-if="!isVideoHidden"
    ref="videoDiv"
    class="fixed z-max videoSize"
    :style="{ top: y + 'px', left: x + 'px' }"
  >

    <q-card
    @mousedown="startDrag"
    @mouseup="stopDrag"
    >
      <q-bar class="drag-handle bg-primary text-white " >
        <q-space />
        <q-btn dense flat icon="close" @click="hide()"/>
      </q-bar>

      <video
        ref = "video"
        :src="getVideoUrl()"
        controls
        preload="auto"
        class="video"
        @play="changeVideoSpeed()"
        :playBackRate="playBackrate"
      >
      </video>

      <div class="speedChoice q-pl-md q-pr-md" >
        <q-select
          color="primary : purple-7"
          v-model="model"
          :options="options"
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
import { defineComponent, PropType, ref } from 'vue';

import { mapState, mapWritableState } from 'pinia';
import { useTreesStore } from 'src/pinia/modules/trees';
import { useVideoStore } from 'src/pinia/modules/video';

export default defineComponent({
  name: "Video",
  props: {
    videoUrl: {
      type : String as PropType<String> | undefined,
      required : false,
    }
  },
  data() {
    return {
      video: null as HTMLVideoElement | null,
      hideText:'Hide video',
      isVideoHidden: false,
      x: ref(20),
      y: ref(100),
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      model: ref('1'),
      options: ['0.25', '0.5', '1', '1.5', '2'],
      sliderValue: ref(1),
      url:'',
      playBackrate: 1,
    }
  },
  computed: {
    ...mapState(useTreesStore, ["filteredTrees"] ),
    ...mapWritableState(useVideoStore, ["videoRef"]),
  },
  mounted(){
    this.videoRef = this.$refs.video as HTMLVideoElement
    this.setVideoPosition()
    this.url = this.getVideoUrl()
  },
  methods: {
    changeHiddenValue(){
      this.isVideoHidden = !this.isVideoHidden
    },
    hide(){
      this.changeHiddenValue()
      if(this.isVideoHidden) {
        this.hideText = "Show video"
      } else {
        this.hideText = "Hide video"
      }
    },
    getVideoUrl(){
      let url =''
      if (!this.videoUrl){
        const conll = Object.values(this.filteredTrees[0].conlls)[0]
        const Url= conll.match(/video_url = (.*?)\n/)
          return Url ? Url[1] : ''
      }
      url = this.videoUrl.toString()
      return url
    },
    moveDiv(e : MouseEvent) {
      if (!this.dragging) return
      this.x = e.clientX - this.offsetX
      this.y = e.clientY - this.offsetY
    },
    startDrag(e: MouseEvent) {
      this.dragging = true
      this.offsetX = e.clientX - this.x
      this.offsetY = e.clientY - this.y
      window.addEventListener('mousemove', this.moveDiv)
    },
    stopDrag() {
      this.dragging = false
      window.removeEventListener('mousemove', this.moveDiv)
    },
    changeVideoSpeed(){
      if (this.videoRef){
        this.videoRef.playbackRate = Number(this.model)
        this.playBackrate = Number(this.model)
      }
    },
    setVideoPosition(){
      //set position to 70% of window's width
      this.x = window.innerWidth * (70/100)
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
.backgroundBtn{
  background-color: "gray";
}
.speedChoice{
  height: auto;
  width: 22%;
}
</style>
