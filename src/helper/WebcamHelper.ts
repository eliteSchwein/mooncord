'use strict'

import {ConfigHelper} from "./ConfigHelper";
import {sleep} from "./DataHelper";
import axios from "axios";
import {resolve} from "path"
import {logEmpty, logError, logRegular} from "./LoggerHelper";
import StackTrace from "stacktrace-js";
import {getMoonrakerClient} from "../Application";
import {getEntry, setData} from "../utils/CacheUtil";
import {AttachmentBuilder} from "discord.js";
import SharpSnapshotBackend from "./snapshotBackend/SharpSnapshotBackend";
import JimpSnapshotBackend from "./snapshotBackend/JimpSnapshotBackend";
import NoneSnapshotBackend from "./snapshotBackend/NoneSnapshotBackend";
import GraphicsMagickSnapshotBackend from "./snapshotBackend/GraphicsMagickSnapshotBackend";

export class WebcamHelper {
    public async generateCache() {
        const moonrakerClient = getMoonrakerClient()
        const config = new ConfigHelper()

        const webcamEntries = await moonrakerClient.send({"method": "server.webcams.list"})
        const webcamData = webcamEntries.result.webcams
        let webcamConfigs = config.getEntriesByFilter(/^webcam(?:\s|$)/g, true)
        let activeWebcam = ''

        const webcamCache = {
            entries: {},
            active: ''
        }

        for (const data of webcamData) {
            if (!data.enabled) {
                continue
            }

            if (activeWebcam === '') {
                activeWebcam = data.name
            }

            webcamCache.entries[data.name] = data
        }

        for (let webcamName in webcamConfigs) {
            const webcamConfig = webcamConfigs[webcamName]

            if(webcamName === '') {
                webcamName = 'default'
            }

            if (activeWebcam === '') {
                activeWebcam = webcamName
            }

            if(webcamConfig.url) {
                webcamConfig.snapshot_url = webcamConfig.url
            }

            webcamConfig.name = webcamName

            webcamCache.entries[webcamName] = webcamConfig
        }

        webcamCache.active = activeWebcam

        setData('webcam', webcamCache)
    }

    public getWebcamChoices() {
        const stateCache = getEntry('webcam')
        const options = []

        for (const key in stateCache.entries) {
            options.push({
                "label": key,
                "value": key
            })
        }

        return options
    }

    public async retrieveWebcam() {
        const cache = getEntry('webcam')
        const webcamData = cache.entries[cache.active]
        const configHelper = new ConfigHelper()
        const snapshotConfig = configHelper.getEntriesByFilter(/^snapshot$/g)[0]

        const beforeStatus = {
            'enable': snapshotConfig.enable_before_snapshot_commands,
            'execute': snapshotConfig.before_snapshot_commands,
            'delay': snapshotConfig.delay_before_snapshot_commands
        }
        const afterStatus = {
            'enable': snapshotConfig.enable_after_snapshot_commands,
            'execute': snapshotConfig.after_snapshot_commands,
            'delay': snapshotConfig.delay_after_snapshot_commands
        }

        try {
            if (webcamData === undefined)
                throw new Error('Config Error: Webcam has invalid config or was not found')

            if (webcamData.snapshot_url.startsWith('/'))
                webcamData.snapshot_url = `http://localhost${webcamData.snapshot_url}`

            logRegular('Run Webcam pre Tasks if present...')
            await this.executePostProcess(beforeStatus)

            logRegular(`Retrieve Webcam ${webcamData.name} Snapshot...`)
            const res = await axios({
                method: 'get',
                responseType: 'arraybuffer',
                url: webcamData.snapshot_url,
                timeout: 2000
            })

            if (!res.headers['content-type'].startsWith('image')) {
                throw new Error('the Webcam URL is not a static image!')
            }

            const buffer = Buffer.from(res.data, 'binary')

            logRegular('Run Webcam follow up Tasks if present...')
            await this.executePostProcess(afterStatus)

            // Only run Sharp if they want the image modifed
            if (
                (webcamData.flip_horizontal ||
                webcamData.flip_vertical ||
                webcamData.rotation) &&
                snapshotConfig.backend !== 'none'
            ) {

                let editBuffer: Buffer

                logRegular(`modify the Snapshot with the ${snapshotConfig.backend} backend...`)

                switch (snapshotConfig.backend) {
                    case 'jimp':
                        editBuffer = await new JimpSnapshotBackend(buffer, webcamData).render()
                        break
                    case 'graphicksmagick':
                    case 'imagemagick':
                    case 'gm':
                        editBuffer = await new GraphicsMagickSnapshotBackend(buffer, webcamData).render()
                        break
                    default:
                        editBuffer = await new SharpSnapshotBackend(buffer, webcamData).render()
                }

                buffer.fill(0)

                return new AttachmentBuilder(editBuffer, {name: "snapshot.png"})
            } else if(snapshotConfig.backend === 'none') {
                logRegular('the none backend is active, the snapshot will be replaced with a empty pixel...')

                const editBuffer = await new NoneSnapshotBackend(buffer, webcamData).render()

                buffer.fill(0)

                return new AttachmentBuilder(editBuffer, {name: "snapshot.png"})
            }

            return new AttachmentBuilder(buffer, {name: "snapshot.png"})
        } catch (error) {
            const reason = error as string
            const trace = await StackTrace.get()

            let url = 'not configured'

            if (webcamData !== undefined)
                url = webcamData.snapshot_url

            logEmpty()
            logError('Webcam Error:')
            logError(`Url: ${url}`)
            logError(`Error: ${reason}`)
            if (configHelper.traceOnWebErrors()) {
                logError(trace)
            }

            logRegular('Run Webcam follow up Tasks if present...')
            await this.executePostProcess(afterStatus)

            return this.getFallbackImage()
        }
    }

    public getFallbackImage() {
        const configHelper = new ConfigHelper()

        return new AttachmentBuilder(
            resolve(__dirname, `../assets/icon-sets/${configHelper.getIconSet()}/snapshot-error.png`),
            {name: 'snapshot-error.png'}
        )
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
            if (execute.key.toLowerCase() === 'gcode') {
                const gcode = execute.value
                try {
                    await moonrakerClient
                        .send(
                            {"method": "printer.gcode.script", "params": {"script": gcode}},
                            new ConfigHelper().getGcodeExecuteTimeout() * 1000
                        )
                } catch (error) {
                    logError(error)
                }
            }
            if (execute.key.toLowerCase() === 'website_post') {
                const url = execute.value
                this.triggerWebsite(url, true)
            }
            if (execute.key.toLowerCase() === 'website') {
                const url = execute.value
                this.triggerWebsite(url, false)
            }
            await sleep(config.delay)
            index++
        }

        await sleep(config.delay)
    }
}

