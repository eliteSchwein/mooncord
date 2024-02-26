'use strict'

import {logNotice} from "../../../helper/LoggerHelper";
import {PowerDeviceHelper} from "../../../helper/PowerDeviceHelper";

export class PowerDeviceNotification {
    public parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }
        if (typeof (message.params) === 'undefined') {
            return false
        }
        if (message.method !== 'notify_power_changed') {
            return false
        }

        const powerDeviceData = message.params[0]

        logNotice(`Power Device ${powerDeviceData.device} switched ${powerDeviceData.status}`)

        new PowerDeviceHelper().updatePowerDevice(powerDeviceData)

        return true
    }
}