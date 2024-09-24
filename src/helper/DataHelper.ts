'use strict'

import {ConfigHelper} from "./ConfigHelper";
import axios from "axios";
import FormData from "form-data";
import {logError, logNotice} from "./LoggerHelper";
import {ActivityType, Attachment, ButtonStyle} from "discord.js";

export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function convertStyle(style: string) {
    if(!style) {
        return ButtonStyle.Secondary
    }
    style = style.trim().toUpperCase()
    switch(style) {
        case "INFO":
            return ButtonStyle.Primary
        case "WARNING":
        case "ERROR":
            return ButtonStyle.Danger
        default:
            return ButtonStyle[style.charAt(0) + style.substring(1).toLowerCase()]
    }
}

export function convertActivityStyle(type: string) {
    if(!type) {
        return ActivityType.Listening
    }
    type = type.trim().toUpperCase()
    return ActivityType[type.charAt(0) + type.substring(1).toLowerCase()]
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

export function formatPercent(percent, digits) {
    return (percent * 100).toFixed(digits)
}

export function formatReduce(value, factor, digits) {
    return (value / factor).toFixed(digits)
}

export function findValueByPartial(data, partial: string, key: string) {
    for (const dataFragment of data) {
        if (dataFragment[key].includes(partial)) {
            return dataFragment[key]
        }
    }
}

export function limitToMax(input: number, max: number) {
    if(max < input) {
        return max
    }

    return input
}

export function limitString(input: string, length: number) {
    if (input.length < length) {
        return input
    }
    return input.slice(0, length)
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

export function stripAnsi(input: string) {
    return input.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '')
}

export function parseCalculatedPlaceholder(fragments) {
    if (fragments[0] === 'percent') {
        return formatPercent(parseFloat(fragments[2]), parseInt(fragments[1]))
    }
    if (fragments[0] === 'reduce') {
        return formatReduce(parseFloat(fragments[3]), parseFloat(fragments[1]), parseInt(fragments[2]))
    }
    if (fragments[0] === 'round') {
        return parseFloat(fragments[2]).toFixed(parseInt(fragments[1]))
    }
    if (fragments[0] === 'max') {
        return limitToMax(parseInt(fragments[2]), parseInt(fragments[1]))
    }
    if (fragments[0] === 'formatDate') {
        return formatDate(parseInt(fragments[1]))
    }
    if (fragments[0] === 'formatTime') {
        return formatTime(parseInt(fragments[1]))
    }
    if (fragments[0] === 'timestamp') {
        return formatTimestamp(parseInt(fragments[1]))
    }
}

export function getObjectValue<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

export function formatTimestamp(seconds) {
    if (isNaN(Number(seconds)) || !isFinite(seconds)) {
        return 'N/A'
    }

    seconds = seconds.toFixed(0)

    const currentDate = new Date()

    const deltaStamp = (seconds * 1000) - currentDate.getTime()
    const deltaHours = deltaStamp / (1000 * 3600)

    if (deltaHours > 24) {
        return `<t:${seconds}:f>`
    }

    return `<t:${seconds}:t>`
}

export function formatTime(seconds) {
    if (isNaN(Number(seconds)) || !isFinite(seconds)) {
        seconds = 0
    }
    let isNeg = false
    if (seconds < 0) {
        seconds = Math.abs(seconds)
        isNeg = true
    }
    const h = Math.floor(seconds / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 3600 % 60)

    let r = `${s}s`
    r = `${m}m ${r}`
    if (h > 0) {
        r = `${h}h ${r}`
    }

    return (isNeg) ? `-${r}` : r
}

export function formatDate(seconds) {
    if (isNaN(Number(seconds)) || !isFinite(seconds)) {
        return 'N/A'
    }

    const configHelper = new ConfigHelper()
    const date = new Date(seconds * 1000)

    return date.toLocaleDateString(configHelper.getDateLocale(),
        {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
}

export async function downloadFile(root: string, fileName: string) {
    const config = new ConfigHelper()

    const result = await axios.get(`${config.getMoonrakerUrl()}/server/files/${root}/${fileName}`, {
        responseType: 'arraybuffer',
        headers: {
            'X-Api-Key': config.getMoonrakerApiKey()
        }
    })

    const bufferSize = Buffer.byteLength(<Buffer>result.data)

    return {
        size: bufferSize,
        data: <Buffer>result.data,
        overSizeLimit: bufferSize > config.getUploadLimit(),
        sizeLimit: config.getUploadLimit()
    }
}

export async function uploadAttachment(attachment: Attachment, fileRoot = 'gcodes', filePath = '') {
    try {
        logNotice(`Upload for ${attachment.name} started`)
        const attachmentData = await axios.get(attachment.url,
            {responseType: 'arraybuffer'})

        const formData = new FormData()
        const configHelper = new ConfigHelper()

        formData.append('file', attachmentData.data, attachment.name)
        formData.append('root', fileRoot)
        formData.append('path', filePath)

        await axios.post(`${configHelper.getMoonrakerUrl()}/server/files/upload`,
            formData,
            {
                'maxContentLength': Infinity,
                'maxBodyLength': Infinity,
                headers: {
                    'X-Api-Key': configHelper.getMoonrakerApiKey(),
                    'Content-Type': `multipart/form-data; boundary=${formData['_boundary']}`
                }
            })
        return true
    } catch (error) {
        logError(`Upload for ${attachment.name} failed:`)
        logError(error)
        return false
    }
}