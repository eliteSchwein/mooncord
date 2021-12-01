import { getMoonrakerClient } from "../Application";
import { MoonrakerClient } from "../clients/MoonrakerClient";
import { setData } from "../utils/CacheUtil";
import {ConfigHelper} from "./ConfigHelper";
import path from "path";
import {MessageAttachment} from "discord.js";
import axios from "axios";
import {updateTimes} from "./TimeHelper";
import {updateLayers} from "./LayerHelper";
import * as StackTrace from 'stacktrace-js'
import {logRegular, logError, logEmpty} from "./LoggerHelper"

export class MetadataHelper {
    protected moonrakerClient: MoonrakerClient
    protected configHelper = new ConfigHelper()

    public constructor(moonrakerClient: MoonrakerClient = null) {
        if(moonrakerClient !== null) {
            this.moonrakerClient = moonrakerClient
        } else {
            this.moonrakerClient = getMoonrakerClient()
        }
    }

    public async getMetaData(filename: string) {
        const metaData = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${filename}"}}`)

        return metaData.result
    }

    public async updateMetaData(filename: string) {
        if(typeof filename === 'undefined') { return }
        if(filename === null) { return }
        if(filename === '') { return }

        const metaData = await this.getMetaData(filename)

        setData('meta_data', metaData)

        updateTimes()
        updateLayers()
    }

    public async getThumbnail(filename: string) {
        const metaData = await this.getMetaData(filename)
        const placeholderPath = path.resolve(__dirname, `../assets/icon-sets/${this.configHelper.getIconSet()}/thumbnail_not_found.png`)
        const placeholder = new MessageAttachment(placeholderPath, 'thumbnail_not_found.png')
        const url = this.configHelper.getMoonrakerUrl()

        if(typeof metaData === 'undefined') { return placeholder }

        const thumbnailFile = metaData.thumbnails.reduce((prev, current) => { return (prev.size > current.size) ? prev : current})
        const relativePath = thumbnailFile.relative_path
        const thumbnailURL = `${url}/server/files/gcodes/${relativePath}`
        let thumbnail: string
        try {
            thumbnail = await this.getBase64(thumbnailURL)
            logRegular(`retrieved Thumbnail for ${filename}`)
        } catch (error) {
            const reason = error as string
            const trace = await StackTrace.get()
            logEmpty()
            logError('Thumbnail Error:')
            logError(`Url: ${thumbnailURL}`)
            logError(`Error: ${reason}`)
            if(this.configHelper.traceOnWebErrors()) {
                logError(trace)
            }
            return placeholder
        }

        const thumbnailBuffer = Buffer.from(thumbnail, 'base64')

        return new MessageAttachment(thumbnailBuffer, 'thumbnail.png')
    }

    protected async getBase64(url:string) {
        const response = await axios.get(url,
            {responseType: 'arraybuffer',
                headers: {
                    'X-Api-Key': this.configHelper.getMoonrakerApiKey()
                }})


        return Buffer.from(response.data, 'binary').toString('base64')
    }
}