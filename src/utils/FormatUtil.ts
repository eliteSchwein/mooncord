import {ConfigHelper} from "../helper/ConfigHelper";

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

export function stripAnsi(input: string) {
    return input.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '')
}

export function formatPercent(percent, digits) {
    return (percent * 100).toFixed(digits)
}

export function formatReduce(value, factor, digits) {
    return (value / factor).toFixed(digits)
}

export function limitToMax(input: number, max: number) {
    if (max < input) {
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