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
      >
      </video>

      <div class="speedChoice q-pl-md q-pr-md" >
        <q-select
          color="primary : purple-7"
          v-model="videoSpeedModel"
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
      hideText:'Hide video',
      isVideoHidden: false,
      x: ref(20),
      y: ref(100),
      dragging: false,
      offsetX: 0,
      offsetY: 0,
      videoSpeedModel: ref('1'),
      options: ['0.25', '0.5', '1', '1.5', '2'],
    }
  },
  computed: {
    ...mapState(useTreesStore, ["filteredTrees"] ),
    ...mapWritableState(useVideoStore, ["videoRef"]),
  },
  mounted(){
    this.videoRef = this.$refs.video as HTMLVideoElement
    this.setVideoPosition()
  },
  methods: {
    changeHiddenValue(){
      this.isVideoHidden = !this.isVideoHidden
    },
    hide(){
      //hide video div and change hide video btn text
      this.changeHiddenValue()
      this.isVideoHidden ? this.hideText = "Show video" : this.hideText = "Hide video"
    },
    getVideoUrl(){
      if (!this.videoUrl){
        //search for video_url in CoNLL if this.videoUrl isn't given
        const conll = Object.values(this.filteredTrees[0].conlls)[0]
        const Url= conll.match(/video_url = (.*?)\n/)
          return Url ? Url[1] : ''
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
      window.addEventListener('mousemove', this.moveDiv)
    },
    stopDrag() {
      this.dragging = false
      window.removeEventListener('mousemove', this.moveDiv)
    },
    changeVideoSpeed(){
      if (this.videoRef){
        this.videoRef.playbackRate = Number(this.videoSpeedModel)
      }
    },
    setVideoPosition(){
      //set video position to 70% of window's width
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
