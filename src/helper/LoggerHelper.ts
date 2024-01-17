'use strict'

import 'colorts/lib/string';
import * as util from 'util'
import * as fs from 'fs'
import * as path from 'path'
import {stripAnsi} from "./DataHelper";
import {updateData} from "../utils/CacheUtil";

let tempLog = ''
let log_file: fs.WriteStream
const log_stdout = process.stdout

function hookLogFile() {
    console.log = (d) => {
        const consoleOutput = `${util.format(d)}\n`
        const consoleLogOutput = stripAnsi(consoleOutput)

        log_stdout.write(consoleOutput)
        log_file.write(consoleLogOutput)
    }

    console.error = console.log
}

export function unhookTempLog() {
    console.log = (d) => {
        const consoleOutput = `${util.format(d)}\n`

        log_stdout.write(consoleOutput)
    }

    console.error = console.log
}

export function tempHookLog() {
    console.log = (d) => {
        const consoleOutput = `${util.format(d)}\n`
        const consoleLogOutput = stripAnsi(consoleOutput)

        log_stdout.write(consoleOutput)

        tempLog = tempLog.concat(consoleLogOutput)
    }

    console.error = console.log
}

export function hookProcess() {
    process.on('uncaughtException', (err) => {
        logEmpty()
        logError(`${err.name}: ${err.message}
            ${err.stack}`)
    })
}

export function changeTempPath(tempPath: string) {
    log_file = fs.createWriteStream(path.resolve(__dirname, `${tempPath}/mooncord.log`), {flags: 'w'})
    log_file.write(tempLog)
    updateData('function', {'log_path': path.resolve(__dirname, `${tempPath}/mooncord.log`)})
    hookLogFile()
}

export function changePath(directory: string) {
    logRegular(`Change Log Path to ${directory}...`)
    if (!fs.existsSync(directory)) {
        logWarn(`Path ${directory} not present`)
        return
    }

    try {
        fs.accessSync(directory, fs.constants.R_OK | fs.constants.W_OK)
    } catch {
        logWarn(`Cant Read or/and Write to ${directory}`)
        return
    }

    let current: Buffer

    try {
        current = fs.readFileSync(log_file.path)
    } catch {
        current = Buffer.from(tempLog, 'utf8')
    }

    log_file = fs.createWriteStream(path.resolve(directory, 'mooncord.log'), {flags: 'w'})

    log_file.write(current)

    updateData('function', {'log_path': path.resolve(directory, 'mooncord.log')})

    hookLogFile()
}

export function logError(message) {
    console.log(`${getLevel('error')} ${getTimeStamp()} ${util.format(message)}`.red)
}

export function logSuccess(message) {
    console.log(`${getLevel('info')} ${getTimeStamp()} ${util.format(message)}`.green)
}

export function logRegular(message) {
    console.log(`${getLevel('info')} ${getTimeStamp()} ${util.format(message)}`.white)
}

export function logNotice(message) {
    console.log(`${getLevel('info')} ${getTimeStamp()} ${util.format(message)}`.magenta)
}

export function logWarn(message) {
    console.log(`${getLevel('warn')} ${getTimeStamp()} ${util.format(message)}`.yellow)
}

export function logCustom(message, level = "info") {
    console.log(`${getLevel(level)} ${getTimeStamp()} ${util.format(message)}`)
}

export function logEmpty() {
    console.log('')
}

function getLevel(level: string) {
    return `[${level}]`.grey
}

function getTimeStamp() {
    const date = new Date()
    return `[${date.toISOString()}]`.grey
}