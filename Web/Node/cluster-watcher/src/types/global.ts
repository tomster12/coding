
export type MachineConfig = {
    name: string,
    ip: string
}

export type MachineState = {
    config: MachineConfig,
    online: boolean,
    lastUpdated: number,
    isRefreshing: boolean
}