<template>
  <div>
    <Line :data="chartData" :options="options"></Line>
  </div>
</template>

<script>
import { Line } from "vue-chartjs"
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: "LineChart",
  components: {
    Line
  },
  props: {
    title: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    chartData() {
      return {
        labels: this.data.map((item) => item.timestamp),
        datasets: [
          {
            label: this.title,
            backgroundColor: "rgba(220, 220, 220, 0.2)",
            borderColor: "rgba(220, 220, 220, 1)",
            pointBackgroundColor: "#bbb",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(220, 220, 220, 1)",
            data: this.data.map((item) => item.sensor_data)
          }
        ]
      };
    },
    options() {
      return {
        scales: {
          x: {
            display: false
          },
          y: {
            min: -1.0,
            max: 1.0
          }
        },
        plugins: {
            legend: {
              display: false
            }
        }
      };
    }
  },
};
</script>
