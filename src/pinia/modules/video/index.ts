import { defineStore } from 'pinia';

export const useVideoStore = defineStore('video', {
  state: () => ({
    videoRef: null as HTMLVideoElement | null,
  }),

  actions: {
    setVideo(el: HTMLVideoElement | null) {
      this.videoRef = el;
    },

    play() {
      console.log('playVidStore');
      this.videoRef?.play();
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
