<template>
  <div class="container-fluid">
    <div v-for="(data, name) in sensorData" :key="name">
      <div class="row mt-4">
        <div class="col-md-8 offset-md-2">
          <div class="card">
            <div class="card-header">{{ name }}</div>
            <div class="card-body">
              <LineChart :title="name" :data="data"></LineChart>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LineChart from "./components/LineChart.vue";
import axios from "axios";

export default {
  name: "App",
  components: {
    LineChart,
  },
  data() {
    return {
      sensorData: {},
    };
  },
  mounted() {
    this.update();
    setInterval(() => { this.update(); }, 200);
  },
  methods: {
    update() {
    axios.get("/api/sensor-data")
    .then((response) => {
      this.sensorData = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
    }
  }
};
</script>

<style>
.app {
  display: flex;
  flex-wrap: wrap;
}

.card {
  margin: 40px auto;
  padding: 1rem;
  background-color: #bee5ff;
  border-radius: 0.25rem;
  max-width: 500px;
  filter: drop-shadow(5px 5px 10px #00021e);
}

.card-header {
  margin-bottom: 10px;
  font-family: "Trebuchet MS", sans-serif;
  font-size: 24px;
  text-align: center;
  color: #2b2b2b;
}

.card-header, .card-body {
  padding: 10px;
  background-color: #eff9ff;
  border-radius: 0.15rem;
}
</style>
