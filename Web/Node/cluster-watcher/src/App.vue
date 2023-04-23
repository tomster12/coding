<template>
    <div class="header">
        <p class="header-title">Cluster Watcher</p>
        <img class="header-refresh-btn" src="./assets/refresh.png" @click="onGlobalRefresh()" />
        <hr />
    </div>
    <div class="machine-container">
        <Card
            v-for="(machineState, i) in machineStates"
            :machineState=machineState
            @onSettings="onMachineSettings(i)"
            @onRefresh="onMachineRefresh(i)"
        />
    </div>
    <div class="footer"><hr /></div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { MachineState } from "./types/global";
import Card from "./components/Card.vue";

const machineStates: MachineState[] = reactive([
    { config: { name: "Local 1", ip: "127.0.0.1" }, online: false, lastUpdated: Date.now() },
    { config: { name: "Local 2", ip: "127.0.0.23" }, online: true, lastUpdated: Date.now() },
    { config: { name: "Local 2", ip: "127.0.0.23" }, online: true, lastUpdated: Date.now() },
    { config: { name: "Local 2", ip: "127.0.0.23" }, online: true, lastUpdated: Date.now() },
    { config: { name: "Local 2", ip: "127.0.0.23" }, online: true, lastUpdated: Date.now() }
]);

function onGlobalRefresh() {
    for (let i = 0; i < machineStates.length; i++) onMachineRefresh(i);
}

function onMachineSettings(i: number) { }

async function onMachineRefresh(i: number) { 
    machineStates[i].online = !machineStates[i].online;
    machineStates[i].lastUpdated = Date.now();

    const body = JSON.stringify(machineStates[i].config);
    const res = await fetch(`http://localhost:8081/machineState?config=${body}`);
    console.log(res);

    // const machineState = await res.json();
    // machineStates[i] = machineState;
}
</script>

<style lang="scss">
body, html {
    margin: 0px;
    height: 100%;
    background: rgb(27, 27, 27);
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: separate;
    color: white;
}

.header {
    position: relative;
    overflow: auto;

    .header-title {
        margin: 1.5vmin;
        font-size: 3.5vmin;
        text-align: center;
        font-family: "Poppins", sans-serif;
    }
    
    .header-refresh-btn {
        position: absolute;
        padding: 0.8vmin;
        width: 2vmin;
        right: 1.5vmin;
        top: 2.5vmin;
    
        background-color: rgb(189, 189, 189);
        box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75);
        border-radius: 20%;
        border: none;
        cursor: pointer;

        transition: 0.15s background-color;
    
        &:hover {
            background-color: rgb(248, 248, 248);
        }
    }
}

.machine-container {
    padding: 40px;
    display: flex;
    flex-wrap: wrap;
    gap: 40px;
}

.footer {
    position: fixed;
    width: 100%;
    height: 10vmin;
    bottom: 0px;
    background: rgb(27, 27, 27);
}

@font-face {
    font-family: "Poppins";
    src: url("./assets/fonts/Poppins-Regular.ttf");
}
</style>
