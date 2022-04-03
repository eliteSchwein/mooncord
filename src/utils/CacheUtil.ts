import * as fs from "fs";
import * as path from "path";
import {logSuccess} from "../helper/LoggerHelper";
import * as util from "util";
import {mergeDeep} from "../helper/DataHelper";
import {get} from 'lodash'
import { LocaleHelper } from "../helper/LocaleHelper";

const cacheData:any = {}
const writeFile = util.promisify(fs.writeFile)

export function setData(key:string, value:any) {
    cacheData[key] = value
}

export function updateData(key:string, value:any) {
    cacheData[key] = mergeDeep(cacheData[key], value)
}

export function getEntry(key:string) {
    return cacheData[key]
}

export function findValue(key:string) {
    return get(cacheData, key)
}

export function getMeshProfileChoices() {
    const choices = []

    for(const profile in cacheData.state.bed_mesh.profiles) {
        choices.push({
            "name": profile,
            "value": profile
        })
    }

    return choices
}

export function getServiceChoices() {
    const localeHelper = new LocaleHelper()
    const choices = []

    for(const service of cacheData.machine_info.system_info.available_services) {
        choices.push({
            "name": service,
            "value": service
        })
    }
    
    choices.push({
        "name": localeHelper.getSyntaxLocale().buttons.klipper_restart.label,
        "value": "FirmwareRestart"
    })
    return choices
}

export function getLogPath() {
    return cacheData.server_config.config.server.log_path
}

export async function dump() {
    void await writeDump()
    return cacheData
}

async function writeDump() {
    await writeFile(path.resolve(__dirname, '../temp/cache_dump.json'), JSON.stringify(cacheData, null, 4), { encoding: 'utf8', flag: 'w+' })
    logSuccess('Dumped Cache!')
}