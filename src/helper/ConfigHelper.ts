'use strict'

import {existsSync, mkdirSync, readFileSync} from 'fs'
import path from "path";
import {mergeDeep} from "./DataHelper";
import {getEntry, setData, updateData} from "../utils/CacheUtil";
import {logError, logRegular, logWarn} from "./LoggerHelper";

const args = process.argv.slice(2)

export class ConfigHelper {

    public loadCache() {
        logRegular("load Config Cache...")
        const defaultConfig = this.parseConfig(path.resolve(__dirname, '../scripts/'), 'mooncord_full.cfg')
        mergeDeep(defaultConfig, this.getUserConfig())
        setData('config', defaultConfig)
    }

    public getConfig() {
        return getEntry('config')
    }

    public parseConfig(path: string, filename: string) {
        if(!existsSync(`${path}/${filename}`)) {
            logError(`Config File ${path}/${filename} is not present, skipping!`)
            return {}
        }
        let file = readFileSync(`${path}/${filename}`, {encoding: "utf-8"})
        file = file.replace(/#.*/g, '')
        const lines = file.replace(/\r/g, '').split('\n')
        let result = {}
        let objects = {}
        let tempKey = undefined
        for(const line of lines) {
            if(/^\[include\s(.*\.cfg)\]$/g.test(line)) {
                const subFile = line.split(' ')[1].replace(']','')
                const subData = this.parseConfig(path, subFile)
                mergeDeep(result, subData)
                continue
            }

            const webcamHeader = line.match(/^\[webcam.*\]$/g)
            if(webcamHeader) {
                const name = webcamHeader[0].replace(/\[|\]/g, '').split(' ')
                if(name.length < 2) {
                    name[1] = 'default'
                }
                if(result[name[0]] === undefined) {
                    result[name[0]] = {}
                }

                objects = {}
                result[name[0]][name[1]] = objects
                continue
            }
            const header = line.match(/^\[([^\]]+)\]$/)
            if(header) {
                if(objects[tempKey] !== undefined && objects[tempKey].length === 0) {
                    objects[tempKey] = undefined
                }
                tempKey = undefined
                const name = header[1]
                objects = {}
                result[name] = objects
                continue
            }
            const value = line.match(/^([^;][^:]*):(.*)$/)
            if(value) {
                const key = value[1].trim()

                if(value[2].trim() === '') {
                    tempKey = value[1]
                    objects[value[1]] = []
                    continue
                }

                let realValue = this.parseValue(value[2].trim())

                if(key.match(/[0-9]+_/g)) {
                    const index = Number(key.match(/[0-9]+/g)) - 1
                    const objectRawKey = key.replace(/[0-9]+/g, '')
                    const objectKeys = objectRawKey.split('_')
                    const objectKey = objectKeys[0]
                    const objectKeyValue = objectKeys[1]

                    if(objects[objectKey] === undefined) {
                        objects[objectKey] = []
                    }

                    if(objects[objectKeys[0]][index] === undefined) {
                        objects[objectKeys[0]].push({[objectKeyValue]: realValue})
                    } else {
                        objects[objectKeys[0]][index][objectKeyValue] = realValue
                    }
                    continue
                }

                if(key.startsWith('- {') && objects[tempKey] !== undefined) {
                    realValue = this.parseValue(`${key}:${value[2].trim()}`)
                    objects[tempKey].push(realValue)
                    continue
                }

                if(key.startsWith('- ') && objects[tempKey] !== undefined) {
                    objects[tempKey].push({key: key.substring(2), value: realValue})
                    continue
                }
                if(objects[tempKey] !== undefined && objects[tempKey].length === 0) {
                    objects[tempKey] = undefined
                }
                tempKey = undefined
                objects[value[1]] = realValue
                continue
            }
            if(tempKey !== undefined && objects[tempKey] !== undefined) {
                const currentLine = this.parseValue(line.trim())
                if(currentLine === undefined || currentLine.length === 0) {
                    continue
                }
                objects[tempKey].push(currentLine)
            }
            if(objects[tempKey] !== undefined && objects[tempKey].length === 0) {
                objects[tempKey] = undefined
            }
        }

        return result
    }

    private parseValue(value: string) {
        let realValue: any = value

        if(realValue === '') {
            return undefined
        }

        if(realValue.startsWith('- ')) {
            realValue = realValue.substring(2)
        }

        const numberValue = Number(value)
        if(!isNaN(numberValue)) {
            realValue = numberValue
        }
        if(realValue === 'true') {
            realValue = true
        }
        if(realValue === 'false') {
            realValue = false
        }
        if(typeof realValue === 'string' && realValue.match(/^\{.*\}/g)) {
            realValue = JSON.parse(realValue)
        }
        if(typeof realValue === 'string') {
            realValue = realValue.replace(/\'/g,'')
        }

        return realValue
    }

    public getUserConfig() {
        return this.parseConfig(args[0], 'mooncord.cfg')
    }

    public getUserConfigPath() {
        return args[0]
    }

    public writeUserConfig(modifiedConfig) {
        updateData('config', modifiedConfig)

        logWarn('write config is currently unsupported!')

        //writeFileSync(this.configLegacyPath, JSON.stringify(modifiedConfig, null, 4), {encoding: 'utf8', flag: 'w+'})
    }

    public getPermissions() {
        return this.getConfig().permission
    }

    public getMoonrakerSocketUrl() {
        return this.getEntriesByFilter(/^connection$/g)[0].moonraker_socket_url
    }

    public getMoonrakerUrl() {
        let url = this.getEntriesByFilter(/^connection$/g)[0].moonraker_url

        if(url.endsWith('/')) {
            url = url.substring(0, url.length - 1)
        }

        return url
    }

    public getMoonrakerApiKey() {
        return this.getEntriesByFilter(/^connection$/g)[0].moonraker_token
    }

    public getDiscordToken() {
        return this.getEntriesByFilter(/^connection$/g)[0].bot_token
    }

    public getStatusInterval() {
        return this.getEntriesByFilter(/^status$/g)[0].update_interval
    }

    public getStatusMinInterval() {
        return this.getEntriesByFilter(/^status$/g)[0].min_interval
    }

    public isStatusPerPercent() {
        return this.getEntriesByFilter(/^status$/g)[0].use_percent
    }

    public getLocale() {
        const section = this.getEntriesByFilter(/^language$/g)[0]
        return {
            'locale': section.messages,
            'syntax': section.commands
        }
    }

    public isButtonSyntaxLocale() {
        return this.getEntriesByFilter(/^language$/g)[0].buttons_use_commands_language
    }

    public notifyOnMoonrakerThrottle() {
        return this.getEntriesByFilter(/^notifications$/g)[0].show_no_permission_private
    }

    public dumpCacheOnStart() {
        return this.getEntriesByFilter(/^develop$/g)[0].dump_cache_on_start
    }

    public showNoPermissionPrivate() {
        return this.getEntriesByFilter(/^message$/g)[0].show_no_permission_private
    }

    public getLogPath() {
        const path = this.getEntriesByFilter(/^logger$/g)[0].path

        if(path === undefined || path === '') {
            return this.getTempPath()
        }

        return path
    }

    public isLogFileDisabled() {
        return this.getEntriesByFilter(/^logger$/g)[0].disable_file
    }

    public getTempPath() {
        const temppath = this.getEntriesByFilter(/^logger$/g)[0].tmp_path

        if (!existsSync(temppath)) {
            mkdirSync(temppath)
        }

        return temppath
    }

    public getIconSet() {
        return this.getEntriesByFilter(/^message$/g)[0].icon_set
    }

    public getEmbedMeta() {
        return this.getEntriesByFilter(/^embed /g, true)
    }

    public getModalMeta() {
        return this.getEntriesByFilter(/^modal /g, true)
    }

    public getInputMeta() {
        return {
            'buttons': this.getEntriesByFilter(/^button /g, true),
            'selections': this.getEntriesByFilter(/^select_menu /g, true),
            'inputs': this.getEntriesByFilter(/^textinput /g, true)
        }
    }

    public getStatusMeta() {
        return this.getEntriesByFilter(/^status /g, true)
    }

    public getTempMeta() {
        return this.getConfig().temp_meta
    }

    public getDateLocale() {
        return this.getConfig().language.date_locale
    }

    public getDiscordRequestTimeout() {
        return this.getEntriesByFilter(/^connection$/g)[0].discord_request_timeout
    }

    public getEntriesPerPage() {
        return this.getEntriesByFilter(/^message$/g)[0].page_entries
    }

    public traceOnWebErrors() {
        return this.getEntriesByFilter(/^develop$/g)[0].trace_on_web_error
    }

    public getMoonrakerRetryInterval() {
        return this.getEntriesByFilter(/^connection$/g)[0].moonraker_retry_interval
    }

    public notifyOnTimelapseFinish() {
        return this.getEntriesByFilter(/^notifications$/g)[0].timelapse
    }

    public getM117NotifactionConfig() {
        return this.getEntriesByFilter(/^notifications$/g)[0].gcode_notifications
    }

    public getGcodeExecuteTimeout() {
        return this.getEntriesByFilter(/^status$/g)[0].gcode_timeout
    }

    public getIcons(filter: RegExp, asObject = false) {
        let result: any = []
        const config = this.getConfig()

        if(asObject) {
            result = {}
        }

        for (const key in config) {
            if(!key.match(/icon.*/g)) {
                continue
            }
            if(!key.match(filter)) {
                continue
            }

            if(asObject) {
                const realKey = key.replace(/^icon /g, '')
                result[realKey] = config[key]
            } else {
                result.push(config[key])
            }
        }

        return result
    }

    public getColors(filter: RegExp, asObject = false) {
        let result: any = []
        const config = this.getConfig()

        if(asObject) {
            result = {}
        }

        for (const key in config) {
            if(!key.match(/color.*/g)) {
                continue
            }
            if(!key.match(filter)) {
                continue
            }

            if(asObject) {
                const realKey = key.replace(/^color /g, '')
                result[realKey] = config[key]
            } else {
                result.push(config[key])
            }
        }

        return result
    }

    public getEntriesByFilter(filter: RegExp, asObject = false) {
        let result: any = []
        const config = this.getConfig()

        if(asObject) {
            result = {}
        }

        for (const key in config) {
            if(!key.match(filter)) {
                continue
            }

            if(asObject) {
                const realKey = key.replace(filter, '')
                result[realKey] = config[key]
            } else {
                result.push(config[key])
            }
        }

        return result
    }
}