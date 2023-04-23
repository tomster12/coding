<template>
    <div class="card">
        <p class="title">{{ machineState.config.name }}</p>
        <img class="settings btn" src="../assets/settings-light.png" @click="$emit('onSettings')" />
        <img class="refresh btn" src="../assets/refresh-light.png" @click="$emit('onRefresh')" />
        <hr />
        <div class="props">
            <div class="props-key">IP</div>     <div class="props-value">{{ machineState.config.ip }}</div>
            <div class="props-key">Online</div> <div class="props-value">{{ machineState.online ? "🟢" : "🔴" }}</div>
        </div>
        <p class="last-updated">Last Updated: {{ formatDate(now - machineState.lastUpdated) }}</p>
    </div>
</template>

<script setup lang="ts">
import { PropType, reactive, ref } from "vue";
import { MachineState } from "../types/global";

const props = defineProps({
    machineState: {
        type: Object as PropType<MachineState>,
        required: true
    }
});

defineEmits([ "onSettings", "onRefresh" ]);

let formatDate = (ms: number): string => ms < (60 * 1000)
    ? (Math.max(0, Math.ceil(ms / 1000)) + "s")
    : (Math.floor(ms / (60 * 1000)) + "m");

let now = ref(Date.now());
function updateNow() { now.value = Date.now(); }
setInterval(() => updateNow(), 1000);
</script>

<style lang="scss" scoped>
.card {
    padding: 6px;
    width: 200px;
    position: relative;

    color: white;
    font-size: 17px;
    font-family: "Poppins", sans-serif;

    border-radius: 10px;
    border: 1px solid rgb(255, 255, 255);
    background-color: rgb(24, 24, 24); 

    .title {
        margin: 14px;
        text-align: center;
        font-size: 21px;
        font-weight: bold;
    }

    .btn {
        padding: 7px;
        width: 20px;
        cursor: pointer;
        border-radius: 6px;

        transition: 0.15s background-color;

        &:hover {
            background-color: rgb(81, 81, 81);
            box-shadow: 2px 2px 10px 0px rgba(0, 0, 0, 0.5);
        }
    }

    .settings {
        position: absolute;
        left: 16px;
        top: 18px;
    }

    .refresh {
        position: absolute;
        top: 16px;
        right: 16px;
    }

    .props {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 7px 0px;
        row-gap: 7px;

        .props-key {
            font-weight: bold;
            text-align: left;
            padding-left: 15px;
        }

        .props-value {
            text-align: right;
            padding-right: 15px;
        }
    }

    .last-updated {
        color: rgb(89, 89, 89);
        margin-bottom: 4px;
        margin-right: 4px;
        font-size: 14px;
        text-align: center;
    }
}
</style>
