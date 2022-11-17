import {FileListHelper} from "../../../helper/FileListHelper";
import {getMoonrakerClient} from "../../../Application";
import {logNotice} from "../../../helper/LoggerHelper";
import {PowerDeviceHelper} from "../../../helper/PowerDeviceHelper";
import {getEntry} from "../../../utils/CacheUtil";
import {mergeDeep} from "../../../helper/DataHelper";

export class PowerDeviceNotification {
    protected powerDeviceHelper = new PowerDeviceHelper()

    public parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }

        if(message.method !== 'notify_power_changed') { return }

        const powerDeviceData = message.params[0]

        logNotice(`Power Device ${powerDeviceData.device} switched ${powerDeviceData.status}`)

        this.powerDeviceHelper.updatePowerDevice(powerDeviceData)
    }
}