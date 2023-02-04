import path from "path";
import {logRegular, logSuccess} from "./LoggerHelper";
import {readFileSync, unlinkSync, writeFileSync} from "fs";
import {waitUntil} from "async-wait-until";
import {ConfigHelper} from "./ConfigHelper";
import {getMoonrakerClient} from "../Application";
import {LocaleHelper} from "./LocaleHelper";
import {NotificationHelper} from "./NotificationHelper";
import Ffmpeg from "fluent-ffmpeg";
import * as ffmpegInstall from "@ffmpeg-installer/ffmpeg";
import axios from "axios";
import {MessageAttachment} from "discord.js";
import {DiscordInputGenerator} from "../generator/DiscordInputGenerator";
import {TemplateHelper} from "./TemplateHelper";

export class TimelapseHelper {
    protected inputGenerator = new DiscordInputGenerator()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected notificationHelper = new NotificationHelper()
    protected templateHelper = new TemplateHelper()
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

    public async downloadTimelapse(filename: string, timelapseMessage: string) {

        const result = await axios.get(`${this.configHelper.getMoonrakerUrl()}/server/files/timelapse/${filename}`,{
            responseType: 'arraybuffer',
            headers: {
                'X-Api-Key': this.configHelper.getMoonrakerApiKey()
            }
        })

        let timelapseRaw = result.data

        if(Buffer.byteLength(timelapseRaw) > 8_388_608) {
            timelapseRaw = await this.compressTimelapse(timelapseRaw, filename)
        }
        // @ts-ignore
        const buttonData = this.templateHelper.getInputData('buttons', ['to_timelapselist'])
        const buttons = this.inputGenerator.generateButtons(buttonData)

        const attachment = new MessageAttachment(timelapseRaw, filename)

        return {content: timelapseMessage, files: [attachment], components:  [buttons]
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