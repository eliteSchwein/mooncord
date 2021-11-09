import {ConfigHelper} from "./ConfigHelper";
import {sleep} from "./DataHelper";
import axios from "axios";
import sharp from "sharp";
import {MessageAttachment} from "discord.js";
import {resolve} from "path"
import {logError} from "./LoggerHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";
import fetch from "node-fetch";

export class WebcamHelper {
    protected configHelper = new ConfigHelper()
    protected moonrakerClient: MoonrakerClient

    public async retrieveWebcam(moonrakerClient: MoonrakerClient) {
        this.moonrakerClient = moonrakerClient

        const beforeStatus = this.configHelper.getStatusBeforeTasks()
        const afterStatus = this.configHelper.getStatusAfterTasks()

        await this.executePostProcess(beforeStatus)

        try {
            const res = await fetch(this.configHelper.getWebcamUrl())
            const buffer = await res.buffer()

            // Only run Jimp if they want the image modifed
            if (
                this.configHelper.getWebcamBrightness() ||
                this.configHelper.getWebcamContrast() ||
                this.configHelper.isWebcamGreyscale() ||
                this.configHelper.isWebcamHorizontalMirrored() ||
                this.configHelper.getWebcamRotation() ||
                this.configHelper.isWebcamSepia() ||
                this.configHelper.isWebcamVerticalMirrored()
            ) {
                const image = sharp(buffer)

                image
                    .rotate(this.configHelper.getWebcamRotation())
                    .flip(this.configHelper.isWebcamVerticalMirrored())
                    .flop(this.configHelper.isWebcamHorizontalMirrored())
                    .greyscale(this.configHelper.isWebcamGreyscale())

                if(this.configHelper.getWebcamBrightness()) {
                    image.modulate({
                        brightness: (this.configHelper.getWebcamBrightness() + 1)
                    })
                }

                if(this.configHelper.getWebcamContrast()) {
                    image.linear(this.configHelper.getWebcamContrast() + 1, -(128 * (this.configHelper.getWebcamContrast() + 1)) + 128)
                }

                if (this.configHelper.isWebcamSepia()) {
                    image.recomb([
                        [0.3588, 0.7044, 0.1368],
                        [0.299, 0.587, 0.114],
                        [0.2392, 0.4696, 0.0912],
                    ])
                }

                image.png({
                    quality: this.configHelper.getWebcamQuality()
                })

                const editBuffer = await image.toBuffer()

                await this.executePostProcess(afterStatus)

                return new MessageAttachment(editBuffer, "snapshot.png")
            }

            // Else just send the normal images
            await this.executePostProcess(afterStatus)

            return new MessageAttachment(buffer, "snapshot.png")
        } catch (error) {
            if (error) {
                logError(`Webcam Issue: ${error}`)

                return new MessageAttachment(
                    resolve(__dirname, "../images/snapshot-error.png"),
                    "snapshot-error.png"
                )
            }
        }
    }

    protected async triggerWebsite(url, post) {
        if (post) {
            await axios.post(url)
            return
        }
        await axios.get(url)
    }

    protected async executePostProcess(config) {
        if (!config.enable || config.execute.length === 0) {
            return
        }

        await sleep(config.delay)

        let index = 0

        while (index < config.execute.length) {
            const execute = config.execute[index]
            if (execute.startsWith("gcode:")) {
                const gcode = execute.replace("gcode:", "")
                const id = Math.floor(Math.random() * Number.parseInt("10_000")) + 1
                await this.moonrakerClient
                    .send(
                        `{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${gcode}"}, "id": ${id}}`
                    )
            }
            if (execute.startsWith("website_post:")) {
                const url = execute.replace("website_post:", "")
                await this.triggerWebsite(url, true)
            }
            if (execute.startsWith("website:")) {
                const url = execute.replace("website:", "")
                await this.triggerWebsite(url, false)
            }
            await sleep(config.delay)
            index++
        }

        await sleep(config.delay)
    }
}

