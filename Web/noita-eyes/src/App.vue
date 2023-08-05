<template>
<div id="content">
  <h1 id="title">Noita Eyes</h1>
  <div class="spacer" />
  <DataViewer />
  <div class="spacer" />
  <DataViewer />
  <div class="spacer" />
</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DataViewer from "./DataViewer.vue";

export default defineComponent({
  name: "App",
  components: {
    "DataViewer": DataViewer
  }
});
</script>

<style lang="scss">
@font-face {
    font-family: "Lato Regular";
    src: url('assets/Lato-Regular.ttf');
}

* {
  margin: 0px;
  padding: 0px;
  font-family: "Lato Regular";
  color: rgb(193, 193, 200);
  box-sizing: border-box;
}

body {
  background-color: rgb(30, 37, 56);
}

#content {
  margin: auto;
  width: 80%;
  text-align: justify;
}

#title {
  text-align: center;
  margin: 40px 0px 30px 0px;
  font-size: 45px;
}

.spacer {
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background-color: rgb(95, 95, 104);
  margin: 30px 0px;
}
</style>
