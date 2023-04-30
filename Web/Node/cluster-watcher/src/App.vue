<template>
    <div class="header">
        <div class="header-bar">
            <p class="header-title">Cluster Watcher</p>
            <div class="header-widgets">
                <img class="header-refresh-btn" src="./assets/refresh.png" @click="refreshAll()" />
            </div>
        </div>
        <hr />
    </div>

    <div class="machine-container">
        <Card
            v-for="(machineState, i) in machineStates"
            :machineState=machineState
            @onClose="closeMachine(i)"
            @onRefresh="refreshMachine(i)"
        /> 
    </div>

    <div class="footer"><hr /></div>
    <transition-group name="notification-transition" tag="div" class="notification-container">
        <div v-for="notification in notifications" :key="notification.id" class="notification" @click="closeNotification(notification)">
            <p>{{ notification.message }}</p>
        </div>
    </transition-group>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { MachineState } from "./types/global";
import Card from "./components/Card.vue";

const machineStates: MachineState[] = reactive([
    { config: { name: "Local 1", ip: "127.0.0.1" }, online: false, lastUpdated: Date.now(), isRefreshing: false },
    { config: { name: "Local 2", ip: "127.0.0.23" }, online: true, lastUpdated: Date.now(), isRefreshing: false },
    { config: { name: "Local 2", ip: "127.0.0.23" }, online: true, lastUpdated: Date.now(), isRefreshing: false },
    { config: { name: "Local 2", ip: "127.0.0.23" }, online: true, lastUpdated: Date.now(), isRefreshing: false },
    { config: { name: "Local 2", ip: "127.0.0.23" }, online: true, lastUpdated: Date.now(), isRefreshing: false }
]);

type Notification = { id: number, message: string };

let nextNotificationID = 0;
const notifications: Notification[] = reactive([]);

function addNotification(message: string, timer: number = 5000) {
    const notification: Notification = { id: nextNotificationID++, message: message };
    setTimeout(() => closeNotification(notification), timer);
    notifications.splice(notifications.length, 0, notification);
}

function closeNotification(notification: Notification) {
    notifications.splice(notifications.indexOf(notification), 1);
}

function closeMachine(i: number) {
    machineStates.splice(i, 1);
}

function refreshAll() {
    for (let i = 0; i < machineStates.length; i++) refreshMachine(i);
}

async function refreshMachine(i: number) {
    if (machineStates[i].isRefreshing) return;

    const body = JSON.stringify(machineStates[i].config);
    const baseUrl = `http://localhost:8081/machineState`;
    const url = `${baseUrl}?config=${body}`;
    machineStates[i].isRefreshing = true;

    try {
        const res = await fetch(url);
        const machineState = await res.json();
        machineStates[i] = machineState;
        console.log(res);
    }
    catch {
        addNotification(`Could not connect to API at:\n'${baseUrl}'`);
    }
    finally {
        machineStates[i].online = !machineStates[i].online;
        machineStates[i].lastUpdated = Date.now();
        machineStates[i].isRefreshing = false;
    }
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
    display: flex;
    position: relative;
    flex-direction: column;
    width: 100%;
    height: 8vmin;
    border-collapse: separate;
    overflow: hidden;

    .header-bar {
        position: relative;
        flex-grow: 1;
        display: flex;
        align-items: center;

        .header-title {
            margin: auto;
            font-size: 3.5vmin;
            text-align: center;
            font-family: "Poppins", sans-serif;
        }
    
        .header-widgets {
            position: absolute;
            top: 0px;
            right: 0px;
            width: 20%;
            height: 100%;
            display: flex;
            flex-direction: row-reverse;
            align-items: center;
            gap: 1.5vmin;
            padding: 1.5vmin;
            box-sizing: border-box;

            .header-refresh-btn {
                padding: 0.8vmin;
                width: 2vmin;
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
    }

    hr {
        width: 100%;
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

.notification-container {
    position: absolute;
    right: 0px;
    bottom: 0px;
    display: flex;
    flex-direction: column-reverse;
    margin: 20px;
    gap: 20px;

    .notification {
        display: block;
        width: 300px;
        padding: 10px 20px;
        background-color: rgb(119, 119, 119);
        border-radius: 10px;
        cursor: pointer;
        user-select: none;
        font-weight: bold;
            
        &:hover {
            background-color: rgb(156, 156, 156);
        }
    }

    .notification-transition-enter-active, .notification-transition-leave-active {
        transition: all 0.2s;
    }

    .notification-transition-enter-from, .notification-transition-leave-to {
        opacity: 0;
    }
}

@font-face {
    font-family: "Poppins";
    src: url("./assets/fonts/Poppins-Regular.ttf");
}
</style>
