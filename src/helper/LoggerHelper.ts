import 'colorts/lib/string';
import * as util from 'util'
import * as fs from 'fs'
import * as path from 'path'
import {stripAnsi} from "./FormattingHelper";

let log_file = fs.createWriteStream(path.resolve(__dirname, '../temp/log.log'), {flags : 'w'});
let log_stdout = process.stdout;

export function hookLogFile() {
    console.log = function(d) { //
        const consoleOutput = `${util.format(d)}\n`
        const consoleLogOutput = stripAnsi(consoleOutput)

        log_stdout.write(consoleOutput);
        log_file.write(consoleLogOutput)
    };
    console.error = console.log;

    process.on('uncaughtException', function(err) {
        logError(`${err.name}: ${err.message}
            ${err.stack}`)
    });
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

    const current = fs.readFileSync(log_file.path)

    log_file = fs.createWriteStream(path.resolve(directory, 'mooncord.log'), {flags : 'w'});
    log_stdout = process.stdout;

    log_file.write(current)
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