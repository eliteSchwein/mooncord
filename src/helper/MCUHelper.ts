'use strict'

import {findValue, getEntry} from "../utils/CacheUtil";

export class MCUHelper {

    public getMCUOptions() {
        const stateCache = getEntry('state')
        const options = []

        for (const key in stateCache) {
            if (key.startsWith('mcu')) {
                options.push({
                    "label": key,
                    "value": key
                })
            }
        }

        return options
    }

    public getMCULoad(mcu: string) {
        const rawMCUData = findValue(`state.${mcu}`)

        const mcuLoad = ((rawMCUData.last_stats.mcu_task_avg + 3 * rawMCUData.last_stats.mcu_task_stddev) / 0.0025) * 100
        const mcuAwake = (rawMCUData.last_stats.mcu_awake / 5) * 100
        const mcuFreq = rawMCUData.last_stats.freq / 1_000_000

        return {
            "mcu_name": mcu,
            "mcu_load": mcuLoad.toFixed(2),
            "mcu_awake": mcuAwake.toFixed(2),
            "mcu_freq": mcuFreq.toFixed(1),
            "mcu_chipset": rawMCUData.mcu_constants.MCU,
            "mcu_version": rawMCUData.mcu_version,
            "mcu_raw": rawMCUData
        }
    }
}