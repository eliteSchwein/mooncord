import {ConfigHelper} from "../../../helper/ConfigHelper";
import path from "path";
import {getMoonrakerClient} from "../../../Application";
import axios from "axios";
import Ffmpeg from "fluent-ffmpeg";
import {waitUntil} from "async-wait-until";
import {logRegular, logSuccess} from "../../../helper/LoggerHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {MessageAttachment} from "discord.js";
import {NotificationHelper} from "../../../helper/NotificationHelper";
import {readFileSync, unlinkSync, writeFileSync} from "fs";
import * as ffmpegInstall from "@ffmpeg-installer/ffmpeg"
import {TimelapseHelper} from "../../../helper/TimelapseHelper";

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
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }

        if(message.method !== 'notify_timelapse_event') { return }

        if(!this.configHelper.notifyOnMoonrakerThrottle()) { return }

        const param = message.params[0]

        if(param.action !== 'render') { return }
        if(param.status !== 'success') { return }

        const printfile = (param.printfile === '') ? 'n/a' : param.printfile
        const timelapseMessage = this.locale.messages.answers.timelapse
            .replace(/(\${printfile})/g, printfile)

        const timelapseContent = await this.timelapseHelper.downloadTimelapse(param.filename, timelapseMessage)

        logRegular(`Broadcast Timelapse for ${printfile}...`)

        await this.notificationHelper.broadcastMessage(timelapseContent)


        if (global.gc) {
            global.gc()
        }
    }
}