'use strict'

import path, {resolve} from "path";
import {logNotice, logRegular, logSuccess} from "./LoggerHelper";
import {createWriteStream, statSync, unlinkSync} from "fs";
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
import {getEntry} from "../utils/CacheUtil";

export class TimelapseHelper {
    protected inputGenerator = new DiscordInputGenerator()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected notificationHelper = new NotificationHelper()
    protected templateHelper = new TemplateHelper()
    protected ffmpegRender = Ffmpeg()
    protected functionCache = getEntry('function')
    protected timelapseFile = {}
    protected ffmpegArguments = [
        "-pix_fmt yuv420p",
        "-preset veryslow",
        "-g 5",
        "-crf 33",
        "-vf scale=800:-1"
    ]

    public constructor() {
        this.ffmpegRender.setFfmpegPath(ffmpegInstall.path)
    }

    private async finishTimelapse(fileId: string) {
        const path = this.timelapseFile[fileId].path
        const fileStats = statSync(path)
        const fileName = this.timelapseFile[fileId].fileName
        const fileSizeInMegabytes = Math.round((fileStats.size / (1024 * 1000)) * 100) / 100

        logSuccess(`Download Timelapse ${fileName} complete`)
        logRegular(`Timelapse ${fileName} is ${fileSizeInMegabytes}mb big`)

        if(fileSizeInMegabytes > 25) {
            this.timelapseFile[fileId].path = await this.compressTimelapse(path, fileName)
        }

        this.timelapseFile[fileId].finish = true
    }

    public async downloadTimelapse(filename: string, timelapseMessage: string) {
        logRegular(`Downloading Timelapse ${filename}`)
        const fileId = Math.random().toString(36).substring(2,7)
        const path = resolve(this.configHelper.getTempPath(), `timelapse_${fileId}.mp4`)
        const writer = createWriteStream(path)

        this.timelapseFile[fileId] = {
            finish: false,
            fileName: filename,
            path: path
        }

        const result = await axios.get(`${this.configHelper.getMoonrakerUrl()}/server/files/timelapse/${filename}`, {
            responseType: 'stream',
            headers: {
                'X-Api-Key': this.configHelper.getMoonrakerApiKey()
            }
        })

        result.data.pipe(writer)

        writer.on('finish', () => this.finishTimelapse(fileId))
        writer.on('error', () => this.finishTimelapse(fileId))


        await waitUntil(() => this.timelapseFile[fileId].finish === true, Number.POSITIVE_INFINITY)

        const timelapsePath = this.timelapseFile[fileId].path

        delete this.timelapseFile[fileId]

        // @ts-ignore
        const buttonData = this.templateHelper.getInputData('buttons', ['to_timelapselist'])
        const components = []
        const buttons = this.inputGenerator.generateButtons(buttonData)

        for (const rowId in buttons) {
            components.push(buttons[rowId])
        }

        const attachment = new MessageAttachment(timelapsePath, filename)

        return {
            message: {
                content: timelapseMessage, files: [attachment], components
            },
            path: timelapsePath
        }
    }

    private async compressTimelapse(timelapseInput: string, timelapseName: string) {
        const absolutePath = (this.configHelper.getTempPath().startsWith('..')) ? path.join(__dirname, this.configHelper.getTempPath()) : this.configHelper.getTempPath()
        const tempPathShort = path.join(absolutePath, `compressed-${timelapseName}`)
        let renderComplete = false

        logRegular(`Compress Timelapse: ${timelapseName}`)
        if (this.functionCache.current_status === 'printing') {
            logNotice('use single thread for ffmpeg because a print is running')
            this.ffmpegArguments.push('-threads 1')
        }

        this.ffmpegRender
            .addInput(timelapseInput)
            .noAudio()
            .output(tempPathShort)
            .outputOptions(this.ffmpegArguments)
            .on('end', async (stdout, stderr) => {
                renderComplete = true
            })

        this.ffmpegRender.run()

        await waitUntil(() => renderComplete === true, {timeout: Number.POSITIVE_INFINITY})

        logSuccess(`Compressed Timelapse: ${timelapseName}`)

        unlinkSync(timelapseInput)

        return tempPathShort
    }
}