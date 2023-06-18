import {ConfigHelper} from "../../../helper/ConfigHelper";
import {getMoonrakerClient} from "../../../Application";
import Ffmpeg from "fluent-ffmpeg";
import {logRegular} from "../../../helper/LoggerHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {NotificationHelper} from "../../../helper/NotificationHelper";
import * as ffmpegInstall from "@ffmpeg-installer/ffmpeg"
import {TimelapseHelper} from "../../../helper/TimelapseHelper";
import {unlinkSync} from "fs";

export class TimelapseNotification {
    protected timelapseHelper = new TimelapseHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected notificationHelper = new NotificationHelper()
    protected ffmpegRender = Ffmpeg()
    protected ffmpegArguments = [
        "-pix_fmt yuv420p",
        "-preset veryslow",
        "-crf 33",
        "-vf scale=800:-1"
    ]

    public constructor() {
        this.ffmpegRender.setFfmpegPath(ffmpegInstall.path)
    }

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return
        }
        if (typeof (message.params) === 'undefined') {
            return
        }

        if (message.method !== 'notify_timelapse_event') {
            return
        }

        if (!this.configHelper.notifyOnMoonrakerThrottle()) {
            return
        }

        const param = message.params[0]

        if (param.action !== 'render') {
            return
        }
        if (param.status !== 'success') {
            return
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
    }
}