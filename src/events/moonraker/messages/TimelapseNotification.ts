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

export class TimelapseNotification {
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

        const result = await axios.get(`${this.configHelper.getMoonrakerUrl()}/server/files/timelapse/${param.filename}`,{
            responseType: 'arraybuffer',
            headers: {
                'X-Api-Key': this.configHelper.getMoonrakerApiKey()
            }
        })

        let timelapseRaw = result.data

        if(Buffer.byteLength(timelapseRaw) > 8_388_608) {
            timelapseRaw = await this.compressTimelapse(timelapseRaw, param.filename)
        }

        logRegular(`Broadcast Timelapse for ${printfile}...`)

        const attachment = new MessageAttachment(timelapseRaw, param.filename)

        await this.notificationHelper.broadcastMessage({'content': timelapseMessage, 'files': [attachment]})


        if (global.gc) {
            global.gc()
        }
    }

    protected async compressTimelapse(timelapseBuffer: Buffer, timelapseName: string) {
        const absolutePath = (this.configHelper.getTempPath().startsWith('..')) ? path.join(__dirname, this.configHelper.getTempPath()) : this.configHelper.getTempPath()
        const tempPath = path.join(absolutePath, timelapseName)
        const tempPathShort = path.join(absolutePath, `compressed-${timelapseName}`)
        let renderComplete = false

        logRegular(`Compress Timelapse: ${timelapseName}`)

        writeFileSync(tempPath, timelapseBuffer,{encoding: 'utf8', flag: 'w+'})

        this.ffmpegRender
            .addInput(tempPath)
            .noAudio()
            .output(tempPathShort)
            .outputOptions(this.ffmpegArguments)
            .on('end', async (stdout, stderr) => {
                renderComplete = true
            })

        this.ffmpegRender.run()

        await waitUntil(() => renderComplete === true, { timeout: Number.POSITIVE_INFINITY })

        logSuccess(`Compressed Timelapse: ${timelapseName}`)

        unlinkSync(tempPath)

        const timelapseRaw = readFileSync(tempPathShort)

        unlinkSync(tempPathShort)

        return timelapseRaw
    }
}