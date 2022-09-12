import * as fs from "fs";
import * as path from "path";
import {logSuccess} from "../helper/LoggerHelper";
import * as util from "util";
import {mergeDeep} from "../helper/DataHelper";
import {get} from 'lodash'
import {LocaleHelper} from "../helper/LocaleHelper";

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

export function getHeaterArguments() {
    const heaters = cacheData.state.heaters.available_heaters
    const options = {}
    let {heater} = cacheData.locale.commands.preheat.options.manual.options

    if(typeof heater === 'undefined') { heater = {'description': '${heater}'}}

    const {description} = heater

    for(const heater of heaters) {
        const heaterData = cacheData.state.configfile.config[heater]
        const heaterMaxTemp = Number(heaterData.max_temp)
        const heaterMinTemp = Number(heaterData.min_temp)
        options[heater] = {
            'type': 'integer',
            'name': heater,
            'description': description.replace(/(\${heater})/g, heater),
            'required': false,
            'choices': [],
            'options': [],
            'min_value': heaterMinTemp,
            'max_value': heaterMaxTemp
        }
    }

    return options
}

export function getHeaterChoices() {
    const choices = []
    const heaters = cacheData.state.heaters.available_heaters

    for(const heater of heaters) {
        choices.push({
            "name": heater,
            "value": heater
        })
    }
    return choices
}

export function getExcludeChoices() {
    const choices = []
    const excludeObjects = cacheData.state.exclude_object.objects
    const excludedObjects = cacheData.state.exclude_object.excluded_objects

    for(const excludeObject of excludeObjects) {
        if(excludedObjects.includes(excludeObject.name)) {
            continue
        }

        choices.push({
            "name": excludeObject.name,
            "value": excludeObject.name
        })
    }
    return choices
}

export function getConfigFiles() {
    const choices = []
    const configs = cacheData.config_files

    for(const config of configs) {
        choices.push({
            "name": config.path,
            "value": config.path
        })
    }
    return choices
}

export function getPreheatProfileChoices() {
    const choices = []

    for(const profile in cacheData.config.presets) {
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