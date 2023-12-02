<template>
    <div class="card">
        <div class="title-bar">
            <img
                class="btn"
                src="../assets/exit-light.png"
                @click="$emit('close')"
            />
            <p class="title">{{ machineState.config.name }}</p>
            <img
                :class="{ btn: true, refreshing: machineState.isRefreshing }"
                src="../assets/refresh-light.png"
                @click="$emit('refresh')"
            />
        </div>
        <hr />
        <div class="props">
            <div
                v-for="val, key in machineProps"
                :class="{ prop: true, selected: selectedProp == key }"
                @click="editProp(key)"
                v-click-off="() => closeProp(key)"
            >
                <div class="container">
                    <div class="props-key"> {{ key }} </div>
                    <div class="props-value"> {{ val }} </div>
                </div>
            </div>
        </div>
        
        <p class="last-updated">Last Updated: {{ formatDate(now - machineState.lastUpdated) }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onMounted } from "vue";
import { MachineState } from "../types/global";

const props = defineProps<{
    machineState: MachineState,
}>();

const emit = defineEmits<{
  (e: "close"): void
  (e: "refresh"): void
  (e: "update", value: MachineState): void
}>();

const vClickOff = {
    mounted: (el: any, binding: any) => {
        el.clickOffEvent = (event: any) => {
            if (el != event.target && !el.contains(event.target)) binding.value();
        };
        document.body.addEventListener("click", el.clickOffEvent);
    },
    beforeUnmount: (el: any, binding: any, vnode: any, prevVnode: any) => {
        document.body.removeEventListener("click", el.clickOffEvent);
    }
}

// === Machine Props ===

const selectedProp = ref("");

const machineProps = computed(() => {
    return {
        "ip": props.machineState.config.ip,
        "online": props.machineState.online ? "🟢" : "🔴"
    }
});

function closeProp(key?: string) {
    if (key != undefined && key != selectedProp.value) return;
    selectedProp.value = "";
}

function editProp(propName: string) {
    selectedProp.value = propName;
    if (propName == "ip") props.machineState.config.ip += ".5";
    else if (propName == "online") props.machineState.online = !props.machineState.online;
    emit("update", props.machineState);
}

// === Date ===

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
    align-self: flex-start;

    color: white;
    font-size: 17px;
    font-family: "Poppins", sans-serif;
    box-shadow: 2px 2px 10px 0px rgba(0, 0, 0, 0.5);
    border-radius: 10px;
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
                background-color: rgb(144, 144, 144);
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
            background-color: rgb(144, 144, 144);
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
        
        .prop {
            transition: padding 0.4s;

            .container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                padding: 7px 0px;
                row-gap: 7px;
        
                cursor: pointer;
                border-radius: 6px;
                transition: 0.4s background-color, 0.4s transform;

                &:hover {
                    background-color: rgb(144, 144, 144);
                    box-shadow: 2px 2px 10px 0px rgba(0, 0, 0, 0.5);
                }
        
                .props-key {
                    font-weight: bold;
                    text-align: left;
                    padding-left: 15px;
                    overflow: hidden;
                }
        
                .props-value {
                    text-align: right;
                    padding-right: 15px;
                    overflow: hidden;
                }
            }

            &.selected {
                padding: 15px 0px;
                
                .container {
                    transform: scale(1.2);
                    background-color: rgb(176, 176, 176);
                    box-shadow: 2px 2px 10px 0px rgba(0, 0, 0, 0.5);

                    &:hover {
                        background-color: rgb(198, 198, 198);
                    }
                }

            }
        }
    }

    .last-updated {
        color: rgb(89, 89, 89);
        margin-bottom: 4px;
        margin-right: 4px;
        font-size: 14px;
        text-align: center;
    }

    @keyframes popout {
        from{transform:scale(1)}
        to{transform:scale(1.05)}
    }
}
</style>
