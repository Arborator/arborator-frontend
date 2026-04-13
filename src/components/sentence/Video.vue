<template>
  <div
    v-show="!isVideoHidden"
    ref="videoDiv"
    class="fixed z-max videoSize"
    :style="{ top: y + 'px', left: x + 'px', width: videoWidth + '%' }"
  >
    <q-card
    @mousedown="startDrag"
    @mouseup="stopDrag"
    >
      <q-bar class="drag-handle bg-primary text-white bar-toolbar">
        <q-btn
          round
          flat
          dense
          icon="speed"
          size="sm"
          class="speed-btn"
          @click="showSpeedBtn = !showSpeedBtn"
        >
          <q-tooltip>Playback speed</q-tooltip>
        </q-btn>

        <transition name="fade-slide">
          <q-btn-toggle
            v-show="showSpeedBtn"
            v-model="videoSpeed"
            flat
            no-caps
            dense
            toggle-color="secondary"
            text-color="white"
            unelevated
            class="speed-toggle"
            :options="[
              {label: 'x0.25', value: '0.25'},
              {label: 'x0.5', value: '0.5'},
              {label: 'x1', value: '1'},
              {label: 'x1.5', value: '1.5'},
            ]"
            @update:model-value="changeVideoSpeed()"
          />
        </transition>

        <q-space />
        <q-btn round flat dense icon="close" size="sm" @click="toggleVideo()">
          <q-tooltip>Close</q-tooltip>
        </q-btn>
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

      <q-badge
        class="resize-handle "
        @mousedown="startResize"
      >
        <q-icon name="crop" color="transparent"/>
      </q-badge>
    </q-card>
  </div>

  <div class="fixed-bottom-right q-pa-md z-max">
    <q-btn
      class="float-right"
      color="primary"
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
      showSpeedBtn: true,
      videoWidth: 25,
      isResizing: false,
      boundResize: null as ((e: MouseEvent) => void) | null,
      boundStopResize: null as (() => void) | null,
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
      if (!this.dragging ) return
      //set new position to mouse position
      this.x = e.clientX - this.offsetX
      this.y = e.clientY - this.offsetY
    },
    startDrag(e: MouseEvent) {
      if(this.isResizing) return
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
      }
    },
    setVideoPosition(){
      //set video position to 70% of window's width
      this.x = window.innerWidth * 0.7
    },
    startResize(e: MouseEvent) {
      this.isResizing = true;
      // Store the mouse position to calculate resizing
      this.offsetX = e.clientX;
      this.offsetY = e.clientY;
      this.boundResize = this.resize.bind(this)
      this.boundStopResize = this.stopResize.bind(this)
      document.addEventListener('mousemove', this.boundResize);
      document.addEventListener('mouseup', this.boundStopResize);
    },
    resize(e: MouseEvent) {
      if (!this.isResizing) return;
      // Calculate different of mouse position
      const widthChange = this.offsetX - e.clientX - 0.5;
      const prevWidth = this.videoWidth;
      // Update width based on mouse movement
      this.videoWidth = Math.max(10, this.videoWidth + (widthChange / window.innerWidth) * 100);
      //move video to the left
      const actualWidthChangePx = ((this.videoWidth - prevWidth) / 100) * window.innerWidth;
      this.x = this.x - actualWidthChangePx;

      // Update the mouse offset for next movement
      this.offsetX = e.clientX;
      this.offsetY = e.clientY;
    },
    stopResize() {
      this.isResizing = false;
      if (this.boundResize) document.removeEventListener('mousemove', this.boundResize);
      if (this.boundStopResize) document.removeEventListener('mouseup', this.boundStopResize);
      this.boundResize = null;
      this.boundStopResize = null;
    },
  }
})
</script>
  <style lang="css">
  .videoSize{
    width: 25%;
    height: auto;
    text-align: center;
    resize: horizontal;
    overflow: auto;
    min-width: 100px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  }
  .video{
    width: 100%;
    height: auto;
    display: block;
  }
  .bar-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    cursor: grab;
    user-select: none;
    border-radius: 8px 8px 0 0;
  }
  .bar-toolbar:active {
    cursor: grabbing;
  }
  .speed-btn {
    opacity: 0.85;
    transition: opacity 0.2s;
  }
  .speed-btn:hover {
    opacity: 1;
  }
  .speed-toggle {
    border-radius: 20px;
    background: rgba(255,255,255,0.15);
    padding: 0 4px;
    font-size: 0.75rem;
  }
  .speed-toggle .q-btn {
    border-radius: 16px;
    min-height: unset;
    padding: 2px 8px;
    font-size: 0.72rem;
  }
  .speed-toggle .q-btn--active {
    background: rgba(255,255,255,0.9) !important;
    color: var(--q-primary) !important;
    font-weight: 600;
  }
  .resize-handle {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 10px;
    height: 10px;
    cursor: ew-resize;
    background-color: transparent;
  }
  .bold{
    font-weight: bold;
  }
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .fade-slide-enter-from,
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-6px);
  }
</style>
