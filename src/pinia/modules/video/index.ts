import { defineStore } from 'pinia';

export const useVideoStore = defineStore('video', {
  state: () => ({
    videoRef: null as HTMLVideoElement | null,
    videoSpeed: 1,
  }),

  actions: {
    setVideo(el: HTMLVideoElement | null) {
      this.videoRef = el;
    },

    play() {
      console.log('playVidStore');
      if (this.videoRef) {
        this.videoRef.playbackRate = this.videoSpeed;
        this.videoRef?.play();
      }
    },

    pause() {
      console.log('pausestore');
      this.videoRef?.pause();
    },

    setTime(time: number) {
      if (this.videoRef) {
        this.videoRef.currentTime = time;
      }
    },
  },
});
