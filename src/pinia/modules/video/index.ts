import { defineStore } from 'pinia';

export const useVideoStore = defineStore('video', {
  state: () => ({
    videoRef: null as HTMLVideoElement | null,
    videoInGrewSearch: false,
  }),

  actions: {
    setVideo(el: HTMLVideoElement | null) {
      this.videoRef = el;
    },
    play() {
      if (this.videoRef) {
        this.videoRef?.play();
      }
    },

    pause() {
      this.videoRef?.pause();
    },

    setTime(time: number) {
      if (this.videoRef) {
        this.videoRef.currentTime = time;
      }
    },
  },
});
