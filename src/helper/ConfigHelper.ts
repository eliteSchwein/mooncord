'use strict'

import {existsSync, mkdirSync, readFileSync} from 'fs'
import path from "path";
import {mergeDeep} from "./DataHelper";
import parseConfig from "js-conf-parser";
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
        return parseConfig(path, filename)
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
        return this.getEntriesByFilter(/^notifications$/g)[0].moonraker_throttle
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