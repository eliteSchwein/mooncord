'use strict'

import {ConfigHelper} from "./ConfigHelper";
import axios from "axios";
import FormData from "form-data";
import {logEmpty, logError, logNotice} from "./LoggerHelper";
import {ActivityType, Attachment, ButtonStyle, TextInputStyle} from "discord.js";
import * as metaData from "../meta/history_graph_meta.json";
import {MetadataHelper} from "./MetadataHelper";
import {parseData} from "../utils/InputUtil";
import {formatDate, formatPercent, formatReduce, formatTime, formatTimestamp, limitToMax} from "../utils/FormatUtil";
import {get} from "lodash";
import {ImageHelper} from "./ImageHelper";

export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function removeFromArray(array: any[], value: string | number | object) {
    const index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
    }
}

export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}});
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export async function sleep(delay) {
    return await new Promise((r) => setTimeout(r, delay))
}

export function findValueByPartial(data, partial: string, key: string) {
    for (const dataFragment of data) {
        if (dataFragment[key].includes(partial)) {
            return dataFragment[key]
        }
    }
}

export function parsePageData(rawData: string, data) {
    return rawData.replace(/(\${data).*?(})/g, (match) => {
        const dataProperty = match
            .replace(/(\${data.)/g, '')
            .replace(/(})/g, '')

        if (typeof data[dataProperty] === 'undefined') {
            return match
        }
        return data[dataProperty]
    })
}

export async function parseFunctionPlaceholders(fragments) {
    const metadataHelper = new MetadataHelper()

    switch (fragments[0]) {
        case "blank":
            fragments = fragments.slice(1)
            return '${'+fragments.join(':')+'}'
        case "icon":
            return getIcons()[fragments[1]].icon
        case "percent":
            return formatPercent(parseFloat(fragments[2]), parseInt(fragments[1]))
        case "reduce":
            return formatReduce(parseFloat(fragments[3]), parseFloat(fragments[1]), parseInt(fragments[2]))
        case "round":
            return parseFloat(fragments[2]).toFixed(parseInt(fragments[1]))
        case "substr":
            return String(parseData(fragments[2])).substring(0, parseInt(fragments[1]))
        case "max":
            return limitToMax(parseInt(fragments[2]), parseInt(fragments[1]))
        case "formatDate":
            return formatDate(parseInt(fragments[1]))
        case "formatTime":
            return formatTime(parseInt(fragments[1]))
        case "timestamp":
            return formatTimestamp(parseInt(fragments[1]))
        case "isPresent":
            const isIncluded = fragments[1].includes(parseData(fragments[2]))

            return (isIncluded) ? parseData(fragments[3]) : parseData(fragments[4])
        case "isMatching":
            const isValid = parseData(fragments[1]) === parseData(fragments[2])

            return (isValid) ? parseData(fragments[3]) : parseData(fragments[4])
        case "thumbnail":
            const thumbnailBuffer = await metadataHelper.getThumbnail(fragments[1], true, fragments[2] === 'small') as Buffer
            const thumbnailBase64 = `data:image/png;base64,${thumbnailBuffer.toString("base64")}`

            thumbnailBuffer.fill(0)

            return thumbnailBase64
        case "image":
            const imageHelper = new ImageHelper()

            return imageHelper.parseImage(fragments[1])
        case "metadata":
            const metadataKey = fragments[2]
            const filename = fragments[1]
            const metaData = await metadataHelper.getMetaData(filename)

            if(!metaData) return undefined

            let value = get(metaData, metadataKey)

            if(!value) value = fragments[3]

            return value
    }
}

export function getIcons() {
    const configHelper = new ConfigHelper()
    const icons: any = {}

    for (const iconKey of metaData.icons) {
        const iconData = configHelper.getIcons(new RegExp(`${iconKey}`, 'g'))

        if (iconData.length === 0) {
            continue
        }

        icons[iconKey] = iconData[0]
    }

    return icons
}