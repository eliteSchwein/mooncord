'use strict'

import {ConfigHelper} from "../../../helper/ConfigHelper";
import {getMoonrakerClient} from "../../../Application";
import {logRegular} from "../../../helper/LoggerHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {NotificationHelper} from "../../../helper/NotificationHelper";
import {TimelapseHelper} from "../../../helper/TimelapseHelper";
import {unlinkSync} from "fs";

export class TimelapseNotification {
    protected timelapseHelper = new TimelapseHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected notificationHelper = new NotificationHelper()

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }
        if (typeof (message.params) === 'undefined') {
            return false
        }

        if (message.method !== 'notify_timelapse_event') {
            return false
        }

        if (!this.configHelper.notifyOnTimelapseFinish()) {
            return false
        }

        const param = message.params[0]

        if (param.action !== 'render') {
            return false
        }
        if (param.status !== 'success') {
            return false
        }

        const printfile = (param.printfile === '') ? 'n/a' : param.printfile
        const timelapseMessage = this.locale.messages.answers.timelapse
            .replace(/(\${printfile})/g, printfile)

        const timelapseContent = await this.timelapseHelper.downloadTimelapse(param.filename, timelapseMessage)

        logRegular(`Broadcast Timelapse for ${printfile}...`)

        await this.notificationHelper.broadcastMessage(timelapseContent.message)

        unlinkSync(timelapseContent.path)

        if (global.gc) {
            global.gc()
        }

        return true
    }
}