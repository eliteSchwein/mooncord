import {getMoonrakerClient} from "../Application";
import {MoonrakerClient} from "../clients/MoonrakerClient";
import {getEntry, setData, updateData} from "../utils/CacheUtil";
import {ConfigHelper} from "./ConfigHelper";
import path from "path";
import {MessageAttachment} from "discord.js";
import axios from "axios";
import {updateTimes} from "./TimeHelper";
import {updateLayers} from "./LayerHelper";
import * as StackTrace from 'stacktrace-js'
import {logEmpty, logError, logRegular} from "./LoggerHelper"

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
        const metaData = await this.moonrakerClient.send({"method": "server.files.metadata", "params": {filename}})

        return metaData.result
    }

    public async updateMetaData(filename: string) {
        if(typeof filename === 'undefined') { return }
        if(filename === null) { return }
        if(filename === '') { return }

        const metaData = await this.getMetaData(filename)

        setData('meta_data', metaData)
        updateData('meta_data', filename)

        updateTimes()
        updateLayers()
    }

    public async getThumbnail(filename: string) {
        const metaDataCache = getEntry('meta_data')

        if(metaDataCache.filename === filename &&
            typeof metaDataCache.thumbnail !== 'undefined') {

            const thumbnailBuffer = Buffer.from(metaDataCache.thumbnail, 'base64')

            return new MessageAttachment(thumbnailBuffer, 'thumbnail.png')
        }

        const metaData = await this.getMetaData(filename)
        const pathFragments = filename.split('/').slice(0, -1)
        const rootPath = (pathFragments.length > 0) ? `${pathFragments.join('/')}/` : ''
        const placeholderPath = path.resolve(__dirname, `../assets/icon-sets/${this.configHelper.getIconSet()}/thumbnail_not_found.png`)
        const placeholder = new MessageAttachment(placeholderPath, 'thumbnail_not_found.png')
        const url = this.configHelper.getMoonrakerUrl()

        if(typeof metaData === 'undefined') { return placeholder }
        if(typeof metaData.thumbnails === 'undefined') { return placeholder }

        const thumbnailFile = metaData.thumbnails.reduce((prev, current) => { return (prev.size > current.size) ? prev : current})
        const thumbnailPath = thumbnailFile.relative_path
        const thumbnailURL = encodeURI(`${url}/server/files/gcodes/${rootPath}${thumbnailPath}`)
        let thumbnail: string
        try {
            thumbnail = await this.getBase64(thumbnailURL)
            updateData('meta_data', {thumbnail})
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