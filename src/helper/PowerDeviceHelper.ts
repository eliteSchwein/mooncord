import * as App from '../Application'
import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";

export class PowerDeviceHelper {
    protected moonrakerClient = App.getMoonrakerClient()
    protected powerDeviceCache = getEntry('power_devices')

    public constructor(moonrakerClient: MoonrakerClient = null) {
        if(moonrakerClient !== null) {
            this.moonrakerClient = moonrakerClient
        }
    }

    public getPowerDevices() {
        logRegular('Retrieve Power Devices...')
        new Promise(async (resolve, reject) => {
            const powerDevicesData = await this.moonrakerClient.send({"method":"machine.device_power.devices"})

            if(powerDevicesData.error !== undefined) {
                return
            }

            setData('power_devices', powerDevicesData.result.devices)
        })
    }

    public updatePowerDevice(powerDeviceData: any) {
        for(const index in this.powerDeviceCache) {
            const powerDevice = this.powerDeviceCache[index]

            if(powerDeviceData.device = powerDevice.device) {
                this.powerDeviceCache[index] = powerDeviceData
            }
        }

        setData('power_devices', this.powerDeviceCache)
    }

    public parseFields() {
        const fields = []

        for(const powerDevice of this.powerDeviceCache) {
            fields.push({
                'name': powerDevice.device,
                'value': powerDevice.status
            })
        }

        return fields
    }
}