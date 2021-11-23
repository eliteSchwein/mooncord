import exp from "constants";
import {findValue, getEntry} from "../utils/CacheUtil";
import { ConfigHelper } from "./ConfigHelper";

export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function removeFromArray(array: any[], value: string|number|object) {
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
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export async function sleep(delay) {
    return await new Promise((r) => setTimeout(r, delay))
}

export function formatPercent(percent, digits) {
    return (percent*100).toFixed(digits)
}

export function parsePageData(rawData: string, data) {
    const parsedData = rawData.replace(/(\${data).*?(})/g, (match) => {
        const dataProperty = match
            .replace(/(\${data.)/g, '')
            .replace(/(})/g, '')

        if(typeof data[dataProperty] === 'undefined') {
            return match
        }
        return data[dataProperty]
    })
    return parsedData
}

export function stripAnsi(input: string) {
    return input.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '')
}
export function parseCalculatedPlaceholder(fragments) {
    if(fragments[0] === 'percent') {
        return formatPercent(findValue(fragments[2]), fragments[1])
    }
    if(fragments[0] === 'round') {
        return findValue(fragments[2]).toFixed(fragments[1])
    }
    if(fragments[0] === 'formatDate') {
        return formatDate(findValue(fragments[1]))
    }
    if(fragments[0] === 'formatTime') {
        return formatTime(findValue(fragments[1]))
    }
}
export function formatTime(seconds) {
    if (isNaN(Number(seconds)) || !isFinite(seconds)) {seconds = 0}
    let isNeg = false
    if (seconds < 0) {
      seconds = Math.abs(seconds)
      isNeg = true
    }
    const h = Math.floor(seconds / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 3600 % 60)
  
    let r = `${s  }s`
    r = `${m  }m ${  r}`
    if (h > 0) {r = `${h  }h ${  r}`}
  
    return (isNeg) ? `-${  r}` : r
}
export function formatDate(seconds) {
    if (isNaN(Number(seconds)) || !isFinite(seconds)) { return 'N/A' }

    const configHelper = new ConfigHelper()
    const date = new Date(seconds * 1000)

    return date.toLocaleDateString(configHelper.getDateLocale(), 
        { weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit' })
    }