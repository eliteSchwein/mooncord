'use strict'

import * as App from '../Application'
import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";
import {LocaleHelper} from "./LocaleHelper";

export class PowerDeviceHelper {
    protected moonrakerClient = App.getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected powerDeviceCache = getEntry('power_devices')
    protected powerDeviceMeta = getEntry('config')['power_device_meta']
    protected locale = this.localeHelper.getLocale()

    public constructor(moonrakerClient: MoonrakerClient = null) {
        if (moonrakerClient !== null) {
            this.moonrakerClient = moonrakerClient
        }
    }

    public getPowerDeviceData(powerDeviceName: string) {
        for (const index in this.powerDeviceCache) {
            const powerDevice = this.powerDeviceCache[index]

            if (powerDevice.device = powerDeviceName) {
                return powerDevice
            }
        }

        return null
    }

    public getPowerDevices() {
        logRegular('Retrieve Power Devices...')
        new Promise(async (resolve, reject) => {
            const powerDevicesData = await this.moonrakerClient.send({"method": "machine.device_power.devices"})

            if (powerDevicesData.error !== undefined) {
                return
            }

            setData('power_devices', powerDevicesData.result.devices)
        })
    }

    public updatePowerDevice(powerDeviceData: any) {
        for (const index in this.powerDeviceCache) {
            const powerDevice = this.powerDeviceCache[index]

            if (powerDeviceData.device = powerDevice.device) {
                this.powerDeviceCache[index] = powerDeviceData
            }
        }

        setData('power_devices', this.powerDeviceCache)
    }

    public parseFields() {
        const fields = []
        const onLabel = this.locale.embeds.fields.on
            .replace(/(\${icon})/g, this.powerDeviceMeta.on.icon)
        const offLabel = this.locale.embeds.fields.off
            .replace(/(\${icon})/g, this.powerDeviceMeta.off.icon)

        for (const powerDevice of this.powerDeviceCache) {
            fields.push({
                'name': powerDevice.device,
                'value': (powerDevice.status === 'on') ? onLabel : offLabel
            })
        }

        return fields
    }
}