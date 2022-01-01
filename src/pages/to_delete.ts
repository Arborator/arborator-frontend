import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => {
    const count = 0;
    return { count };
  },
  getters: {
    double: (state) => state.count * 2,
  },
  actions: {
    increment(number: number) {
      this.count = this.count + number;
    },
  },
});

export const useBlaStore = defineStore('bla', {
  state: () => ({ username: 'mimi' }),
  getters: {
    bla: (state) => state.username,
  },
  actions: {
    rename() {
      this.username = 'LOLO';
    },
  },
});
