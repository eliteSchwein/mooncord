import 'colorts/lib/string';
import * as util from 'util'
import * as fs from 'fs'
import * as path from 'path'
import {stripAnsi} from "./DataHelper";

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
        logError(`${err.name}: ${err.message}
            ${err.stack}`)
    })
}

export function changeTempPath(tempPath: string) {
    log_file = fs.createWriteStream(path.resolve(__dirname, `${tempPath}/log.log`), {flags : 'w'})
    log_file.write(tempLog)
    hookLogFile()
}

export function changePath(directory: string) {
    logRegular(`Change Log Path to ${directory}...`)
    if(!fs.existsSync(directory)) {
        logWarn(`Path ${directory} not present`)
        return
    }

    try {
        fs.accessSync(directory,fs.constants.R_OK | fs.constants.W_OK)
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

    log_file = fs.createWriteStream(path.resolve(directory, 'mooncord.log'), {flags : 'w'})

    log_file.write(current)

    hookLogFile()
}

export function logError (message:string) {
    console.log(`${getLevel('error')} ${getTimeStamp()} ${message}`.red)
}

export function logSuccess(message:string) {
    console.log(`${getLevel('info')} ${getTimeStamp()} ${message}`.green)
}

export function logRegular(message:string) {
    console.log(`${getLevel('info')} ${getTimeStamp()} ${message}`.white)
}

export function logNotice(message:string) {
    console.log(`${getLevel('info')} ${getTimeStamp()} ${message}`.magenta)
}

export function logWarn(message:string) {
    console.log(`${getLevel('warn')} ${getTimeStamp()} ${message}`.yellow)
}

export function logEmpty() { console.log('') }

function getLevel(level: string) {
    return `[${level}]`.grey
}

function getTimeStamp() {
    const date = new Date()
    return `[${date.toISOString()}]`.grey
}