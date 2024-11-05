<template>
  <Pie :key="key" :options="options" :data="data"></Pie>
</template>
<script lang="ts">
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PropType, defineComponent } from 'vue';

ChartJS.register(ArcElement, Tooltip, Legend)
export default defineComponent({
  name: 'PieChart',
  components: {
    Pie
  }, 
  props: {
    labels: {
      type: Object as PropType<string[]>,
      required: true,
    }, 
    values: {
      type: Object as PropType<number[]>,
      required: true,
    }
  },
  data() {
    const options = {
      responsive: true,
      maintainAspectRatio: false
    }
    const data = {
      labels: [] as string[],
      datasets: [
        {
          backgroundColor: [] as string[],
          data: [] as number[],
        }
      ]
    };
    const backgroundColors: string[] = [];
    return {
      options,
      data,
      backgroundColors,
      key: 0,
    }
  },
  mounted() {
    this.backgroundColors = this.values.map(() => this.getRandomColor());
    this.data.labels = this.labels;
    this.data.datasets[0].backgroundColor = this.backgroundColors;
    this.data.datasets[0].data = this.values;
    this.key += 1;
  }, 
  methods: {
    getRandomColor() {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `rgba(${r}, ${g}, ${b}, 0.7)`;
    }
  }
});
</script>
