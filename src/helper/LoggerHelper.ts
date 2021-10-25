import 'colorts/lib/string';
import * as util from 'util'
import * as fs from 'fs'
import * as path from 'path'

let log_file = fs.createWriteStream(path.resolve(__dirname, '../temp/log.log'), {flags : 'w'});
let log_stdout = process.stdout;

export function hookLogFile() {
    console.log = function(d) { //
        log_file.write(util.format(d) + '\n');
        log_stdout.write(util.format(d) + '\n');
    };
    console.error = console.log;

    process.on('uncaughtException', function(err) {
        logError(`${err.name}: ${err.message}
            ${err.stack}`)
    });
}

export function changePath(directory: string) {
    if(fs.existsSync(directory)) {
        const current = fs.readFileSync(log_file.path)

        log_file = fs.createWriteStream(path.resolve(directory, 'mooncord.log'), {flags : 'w'});
        log_stdout = process.stdout;

        log_file.write(current)
    }
}

export function logError (message:string) {
    console.log(`${getTimeStamp()} ${message}`.red)
}

export function logSuccess(message:string) {
    console.log(`${getTimeStamp()} ${message}`.green)
}

export function logRegular(message:string) {
    console.log(`${getTimeStamp()} ${message}`.white)
}

export function logNotice(message:string) {
    console.log(`${getTimeStamp()} ${message}`.magenta)
}

export function logWarn(message:string) {
    console.log(`${getTimeStamp()} ${message}`.yellow)
}

export function logEmpty() { console.log('') }

function getTimeStamp() {
    const date = new Date()
    return `[${date.toISOString()}]`.grey
}