'use strict'

import * as fs from "fs";
import * as path from "path";
import {logSuccess} from "../helper/LoggerHelper";
import * as util from "util";
import {mergeDeep} from "../helper/DataHelper";
import {get} from 'lodash'
import {LocaleHelper} from "../helper/LocaleHelper";
import {ConfigHelper} from "../helper/ConfigHelper";
import {MCUHelper} from "../helper/MCUHelper";

const cacheData: any = {
    function: {
        current_status: 'botstart',
        status_in_query: false,
        server_info_in_query: false,
        poll_printer_info: false,
        current_percent: 0,
        status_cooldown: 0,
        status_interval: 0,
        log_path: '',
        ignore_pause: false,
        temp_targets: {}
    },
    usage: {
        total_ram: '',
        used_ram: '',
        free_ram: '',
        total_disk: '',
        used_disk: '',
        free_disk: '',
        klipper_load: 0,
        system_load: 0
    },
    time: {
        total: 0,
        duration: 0,
        left: 0,
        eta: 0
    },
    layers: {
        top: 0,
        current: 0
    },
    throttle: {
        cooldown: 0,
        throttle_states: []
    },
    meta_data: {
        filename: ''
    },
    temps: {
        colors: {}
    },
    history: {
        total: {},
        jobs: {}
    },
    execute: {
        running: false,
        to_execute_command: '',
        command_state: '',
        successful_commands: [],
        error_commands: [],
        unknown_commands: []
    },
    commands: [],
    power_devices: []
}
const writeFile = util.promisify(fs.writeFile)

export function setData(key: string, value: any) {
    cacheData[key] = value
}

export function updateData(key: string, value: any) {
    cacheData[key] = mergeDeep(cacheData[key], value)
}

export function getEntry(key: string) {
    return cacheData[key]
}

export function findValue(key: string) {
    return get(cacheData, key)
}

export function getHeaterArguments() {
    const heaters = cacheData.state.heaters.available_heaters
    const options = {}
    let {heater} = cacheData.locale.commands.preheat.options.manual.options

    if (typeof heater === 'undefined') {
        heater = {'description': '${heater}'}
    }

    const {description} = heater

    for (let heater of heaters) {
        const heaterData = cacheData.state.configfile.config[heater]
        heater = heater.replace(/(heater_generic )/g, '')
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

    for (let heater of heaters) {
        heater = heater.replace(/(heater_generic )/g, '')

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

    for (const excludeObject of excludeObjects) {
        if (excludedObjects.includes(excludeObject.name)) {
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

    for (const config of configs) {
        choices.push({
            "name": config.path,
            "value": config.path
        })
    }
    return choices
}

export function getPowerDeviceChoices() {
    const choices = []

    const powerDevices = cacheData.power_devices

    for (const powerDevice of powerDevices) {
        choices.push({
            "name": powerDevice.device,
            "value": powerDevice.device
        })
    }

    return choices
}

export function getSystemInfoChoices() {
    const mcuHelper = new MCUHelper()
    const syntaxLocale = new LocaleHelper().getSyntaxLocale()

    return [...syntaxLocale.commands.systeminfo.options.component.choices, ...mcuHelper.getMCUChoices()]
}

export function getPreheatProfileChoices() {
    const choices = []
    const configPresets = new ConfigHelper().getEntriesByFilter(/^preset /g, true)

    for (const profile in configPresets) {
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

    for (const service of cacheData.machine_info.system_info.available_services) {
        choices.push({
            "name": service,
            "value": service
        })
    }

    choices.push({
        "name": localeHelper.getSyntaxLocale().buttons.klipper_restart.label,
        "value": "FirmwareRestart"
    })

    choices.push({
        "name": localeHelper.getSyntaxLocale().buttons.host.label,
        "value": "Host"
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
    await writeFile(path.resolve(__dirname, '../cache_dump.json'), JSON.stringify(cacheData, null, 4), {
        encoding: 'utf8',
        flag: 'w+'
    })
    logSuccess('Dumped Cache!')
}