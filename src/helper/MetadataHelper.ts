'use strict'

import {getMoonrakerClient} from "../Application";
import {setData, updateData} from "../utils/CacheUtil";
import {ConfigHelper} from "./ConfigHelper";
import path from "path";
import axios from "axios";
import {updateTimes} from "./TimeHelper";
import {updateLayers} from "./LayerHelper";
import * as StackTrace from 'stacktrace-js'
import {logEmpty, logError, logRegular} from "./LoggerHelper"
import {AttachmentBuilder} from "discord.js";
import {fileFromSync} from "node-fetch";

export class MetadataHelper {
    public async getMetaData(filename: string) {
        const metaData = await getMoonrakerClient().send({"method": "server.files.metadata", "params": {filename}})

        return metaData.result
    }

    public async updateMetaData(filename: string) {
        if (typeof filename === 'undefined') {
            return
        }
        if (filename === null) {
            return
        }
        if (filename === '') {
            return
        }

        const metaData = await this.getMetaData(filename)

        setData('meta_data', metaData)
        updateData('meta_data', filename)

        updateTimes()
        updateLayers()
    }

    public async getThumbnail(filename: string, bufferMode: boolean = false) {
        const configHelper = new ConfigHelper()

        const metaData = await this.getMetaData(filename)
        const pathFragments = filename.split('/').slice(0, -1)
        const rootPath = (pathFragments.length > 0) ? `${pathFragments.join('/')}/` : ''
        const placeholderPath = path.resolve(__dirname, `../assets/icon-sets/${configHelper.getIconSet()}/thumbnail_not_found.png`)
        let placeholder: AttachmentBuilder|Buffer = new AttachmentBuilder(placeholderPath, {name: 'thumbnail_not_found.png'})
        const url = configHelper.getMoonrakerUrl()

        if(bufferMode) {
            placeholder = Buffer.from(await fileFromSync(placeholderPath).arrayBuffer())
        }

        if (typeof metaData === 'undefined') {
            return placeholder
        }
        if (typeof metaData.thumbnails === 'undefined') {
            return placeholder
        }

        const thumbnailFile = metaData.thumbnails.reduce((prev, current) => {
            return (prev.size > current.size) ? prev : current
        })

        const thumbnailPath = thumbnailFile.relative_path
        const thumbnailURL = encodeURI(`${url}/server/files/gcodes/${rootPath}${thumbnailPath}`)
        let thumbnail: Buffer
        try {
            thumbnail = await this.getBuffer(thumbnailURL)
            logRegular(`retrieved Thumbnail for ${filename}`)
        } catch (error) {
            const reason = error as string
            const trace = await StackTrace.get()
            logEmpty()
            logError('Thumbnail Error:')
            logError(`Url: ${thumbnailURL}`)
            logError(`Error: ${reason}`)
            if (configHelper.traceOnWebErrors()) {
                logError(trace)
            }
            return placeholder
        }

        if(bufferMode) {
            return thumbnail
        }

        return new AttachmentBuilder(thumbnail, {name: 'thumbnail.png'})
    }

    private async getBuffer(url: string) {
        const response = await axios.get(url,
            {
                responseType: 'arraybuffer',
                headers: {
                    'X-Api-Key': new ConfigHelper().getMoonrakerApiKey()
                }
            })
        return Buffer.from(response.data, 'binary')
    }
}