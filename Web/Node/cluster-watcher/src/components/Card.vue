<template>
    <div class="card">
        <div class="title-bar">
            <img class="btn" src="../assets/exit-light.png" @click="$emit('onClose')" />
            <p class="title">{{ machineState.config.name }}</p>
            <img :class="{ btn: true, refreshing: machineState.isRefreshing }" src="../assets/refresh-light.png" @click="$emit('onRefresh')" />
        </div>
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

defineProps({
    machineState: {
        type: Object as PropType<MachineState>,
        required: true
    }
});

let formatDate = (ms: number): string => ms < (60 * 1000)
    ? (Math.max(0, Math.ceil(ms / 1000)) + "s")
    : (Math.floor(ms / (60 * 1000)) + "m");

let now = ref(Date.now());
const updateNow = () => now.value = Date.now();
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
    box-shadow: 2px 2px 10px 0px rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    border: 1px solid rgb(255, 255, 255);
    background-color: rgb(24, 24, 24);
    user-select: none;

    .title-bar {
        display: flex;
        align-items: center;
        justify-content: space-around;

        .title {
            text-align: center;
            font-weight: bold;
            font-size: 21px;
            margin: 5px;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 6px;
            transition: 0.15s background-color;

            &:hover {
                background-color: rgb(81, 81, 81);
                box-shadow: 2px 2px 10px 0px rgba(0, 0, 0, 0.5);
            }
        }

        .btn {
            padding: 7px;
            width: 20px;
            height: 20px;
            border-radius: 6px;
            cursor: pointer;
            transition: 0.15s background-color;
        }

        .btn:hover {
            background-color: rgb(81, 81, 81);
            box-shadow: 2px 2px 10px 0px rgba(0, 0, 0, 0.5);
        }

        .refreshing {
            background-color: rgb(198, 142, 38);
        }
        .refreshing:hover {
            background-color: rgb(238, 180, 73);
        }
    }

    .props {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 7px 0px;
        row-gap: 7px;
        cursor: pointer;
        border-radius: 6px;
        transition: 0.15s background-color;

        &:hover {
            background-color: rgb(81, 81, 81);
            box-shadow: 2px 2px 10px 0px rgba(0, 0, 0, 0.5);
        }

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
