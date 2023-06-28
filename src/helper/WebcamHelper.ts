'use strict'

import {ConfigHelper} from "./ConfigHelper";
import {sleep} from "./DataHelper";
import axios from "axios";
import sharp from "sharp";
import {MessageAttachment} from "discord.js";
import {resolve} from "path"
import {logEmpty, logError, logRegular} from "./LoggerHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";
import StackTrace from "stacktrace-js";
import {getMoonrakerClient} from "../Application";
import {getEntry, setData} from "../utils/CacheUtil";

export class WebcamHelper {
    public async generateCache() {
        const moonrakerClient = getMoonrakerClient()

        const webcamEntries = await moonrakerClient.send({"method": "server.webcams.list"})
        const webcamData = webcamEntries.result.webcams

        const webcamCache = {
            entries: {},
            active: webcamData[0].name
        }

        for(const data of webcamData) {
            if(!data.enabled) {
                continue
            }

            webcamCache.entries[data.name] = data

            let webcamConfig = new ConfigHelper().getEntriesByFilter(/^webcam$/g)[0][data.name]

            if(webcamConfig === undefined) {
                webcamConfig = {
                    enable_before_snapshot_commands: false,
                    delay_before_snapshot_commands: 0,
                    enable_after_snapshot_commands: false,
                    delay_after_snapshot_commands: 0
                }
            }

            webcamCache.entries[data.name].mooncord_config = webcamConfig
        }

        setData('webcam', webcamCache)
    }

    public async retrieveWebcam() {
        const cache = getEntry('webcam')
        const webcamData = cache.entries[cache.active]

        console.log(webcamData)

        const beforeStatus = {
            'enable': webcamData.enable_before_snapshot_commands,
            'execute': webcamData.before_snapshot_commands,
            'delay': webcamData.delay_before_snapshot_commands
        }
        const afterStatus = {
            'enable': webcamData.enable_after_snapshot_commands,
            'execute': webcamData.after_snapshot_commands,
            'delay': webcamData.delay_after_snapshot_commands
        }

        logRegular('Run Webcam pre Tasks if present...')
        await this.executePostProcess(beforeStatus)

        try {
            logRegular('Retrieve Webcam Snapshot...')
            const res = await axios({
                method: 'get',
                responseType: 'arraybuffer',
                url: webcamData.url,
                timeout: 2000
            })

            if(!res.headers['content-type'].startsWith('image')) {
                throw new Error('the Webcam URL is not a static image!')
            }

            const buffer = Buffer.from(res.data, 'binary')

            // Only run Sharp if they want the image modifed
            if (
                webcamData.brightness ||
                webcamData.contrast ||
                webcamData.greyscale ||
                webcamData.horizontal_mirror ||
                webcamData.rotate ||
                webcamData.sepia ||
                webcamData.vertical_mirror
            ) {
                const image = sharp(buffer)

                if(webcamData.horizontal_mirror && webcamData.vertical_mirror && webcamData.rotate === 0) {
                    webcamData.rotate = 180
                    webcamData.horizontal_mirror = false
                    webcamData.vertical_mirror = false
                }

                image
                    .rotate(webcamData.rotate)
                    .flip(webcamData.vertical_mirror)
                    .flop(webcamData.horizontal_mirror)
                    .greyscale(webcamData.greyscale)

                if (webcamData.brightness) {
                    image.modulate({
                        brightness: (webcamData.brightness + 1)
                    })
                }

                if (webcamData.contrast) {
                    image.linear(webcamData.contrast + 1, -(128 * (webcamData.contrast + 1)) + 128)
                }

                if (webcamData.sepia) {
                    image.recomb([
                        [0.3588, 0.7044, 0.1368],
                        [0.299, 0.587, 0.114],
                        [0.2392, 0.4696, 0.0912],
                    ])
                }

                image.png({
                    quality: webcamData.quality
                })

                const editBuffer = await image.toBuffer()

                buffer.fill(0)

                logRegular('Run Webcam follow up Tasks if present...')
                await this.executePostProcess(afterStatus)

                return new MessageAttachment(editBuffer, "snapshot.png")
            }

            // Else just send the normal images

            logRegular('Run Webcam follow up Tasks if present...')
            await this.executePostProcess(afterStatus)

            return new MessageAttachment(buffer, "snapshot.png")
        } catch (error) {
            const reason = error as string
            const trace = await StackTrace.get()

            logEmpty()
            logError('Webcam Error:')
            logError(`Url: ${webcamData.url}`)
            logError(`Error: ${reason}`)
            if (this.configHelper.traceOnWebErrors()) {
                logError(trace)
            }

            logRegular('Run Webcam follow up Tasks if present...')
            await this.executePostProcess(afterStatus)

            return new MessageAttachment(
                resolve(__dirname, `../assets/icon-sets/${this.configHelper.getIconSet()}/snapshot-error.png`),
                'snapshot-error.png'
            )
        }
    }

    private triggerWebsite(url, post) {
        new Promise(async (resolve, reject) => {
            if (post) {
                await axios.post(url)
                return
            }
            await axios.get(url)
        })
    }

    private async executePostProcess(config) {
        if (!config.enable || config.execute.length === 0) {
            return
        }

        const moonrakerClient = getMoonrakerClient()

        await sleep(config.delay)

        let index = 0

        while (index < config.execute.length) {
            const execute = config.execute[index]
            logRegular(`Execute Webcam Task ${index + 1} from ${config.execute.length}: ${execute}`)
            if (execute.startsWith("gcode:")) {
                const gcode = execute.replace("gcode:", "")
                try {
                    await moonrakerClient
                        .send(
                            {"method": "printer.gcode.script", "params": {"script": gcode}},
                            this.configHelper.getGcodeExecuteTimeout() * 1000
                        )
                } catch (error) {
                    logError(error)
                }
            }
            if (execute.startsWith("website_post:")) {
                const url = execute.replace("website_post:", "")
                this.triggerWebsite(url, true)
            }
            if (execute.startsWith("website:")) {
                const url = execute.replace("website:", "")
                this.triggerWebsite(url, false)
            }
            await sleep(config.delay)
            index++
        }

        await sleep(config.delay)
    }
}

