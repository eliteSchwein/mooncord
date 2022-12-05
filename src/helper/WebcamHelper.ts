import {ConfigHelper} from "./ConfigHelper";
import {sleep} from "./DataHelper";
import axios from "axios";
import sharp from "sharp";
import {MessageAttachment} from "discord.js";
import {resolve} from "path"
import {logEmpty, logError, logRegular} from "./LoggerHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";
import StackTrace from "stacktrace-js";

export class WebcamHelper {
    protected configHelper = new ConfigHelper()
    protected moonrakerClient: MoonrakerClient

    public async retrieveWebcam(moonrakerClient: MoonrakerClient) {
        this.moonrakerClient = moonrakerClient

        const beforeStatus = this.configHelper.getStatusBeforeTasks()
        const afterStatus = this.configHelper.getStatusAfterTasks()

        logRegular('Run Webcam pre Tasks if present...')
        await this.executePostProcess(beforeStatus)

        try {
            logRegular('Retrieve Webcam Snapshot...')
            const res = await axios({
                method: 'get',
                responseType: 'arraybuffer',
                url: this.configHelper.getWebcamUrl(),
                timeout: 2000
            })
            const buffer = Buffer.from(res.data, 'binary')

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
                const image = sharp(Buffer.from(buffer))

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

                logRegular('Run Webcam follow up Tasks if present...')
                await this.executePostProcess(afterStatus)

                return new MessageAttachment(editBuffer, "snapshot.png")
            }

            // Else just send the normal images

            logRegular('Run Webcam follow up Tasks if present...')
            await this.executePostProcess(afterStatus)

            return new MessageAttachment(Buffer.from(buffer), "snapshot.png")
        } catch (error) {
            const reason = error as string
            const trace = await StackTrace.get()

            logEmpty()
            logError('Webcam Error:')
            logError(`Url: ${this.configHelper.getWebcamUrl()}`)
            logError(`Error: ${reason}`)
            if(this.configHelper.traceOnWebErrors()) {
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

    protected triggerWebsite(url, post) {
        new Promise(async (resolve, reject) => {
            if (post) {
                await axios.post(url)
                return
            }
            await axios.get(url)
        })
    }

    protected async executePostProcess(config) {
        if (!config.enable || config.execute.length === 0) {
            return
        }

        await sleep(config.delay)

        let index = 0

        while (index < config.execute.length) {
            const execute = config.execute[index]
            logRegular(`Execute Webcam Task ${index+1} from ${config.execute.length}: ${execute}`)
            if (execute.startsWith("gcode:")) {
                const gcode = execute.replace("gcode:", "")
                try {
                    this.moonrakerClient
                        .sendThread(
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

