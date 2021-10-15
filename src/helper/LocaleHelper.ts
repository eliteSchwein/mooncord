import {readFileSync} from 'fs'

import {ConfigHelper} from "./ConfigHelper";
import path from "path";
import {getEntry} from "../utils/CacheUtil";
import {mergeDeep} from "./ObjectMergeHelper";

export class LocaleHelper {
    protected config = new ConfigHelper()
    protected fallbackLocalePath = path.resolve(__dirname, '../locales/en.json')
    protected localePath = path.resolve(__dirname, `../locales/${this.config.getLocale()}.json`)
    protected syntaxLocalePath = path.resolve(__dirname, `../locales/${this.config.getSyntaxLocale()}.json`)
    protected locale: any
    protected syntaxLocale: any

    public constructor() {
        this.loadFallback()
        this.loadLocales()
    }

    protected loadLocales() {
        const localeRaw = readFileSync(this.localePath, {encoding: 'utf8'})
        const syntaxLocaleRaw  = readFileSync(this.syntaxLocalePath, {encoding: 'utf8'})

        mergeDeep(this.locale, JSON.parse(localeRaw))
        mergeDeep(this.syntaxLocale, JSON.parse(syntaxLocaleRaw))
    }

    protected loadFallback() {
        const fallbackLocaleRaw = readFileSync(this.fallbackLocalePath, {encoding: 'utf8'})
        this.locale = JSON.parse(fallbackLocaleRaw)
        this.syntaxLocale = JSON.parse(fallbackLocaleRaw)
    }

    public getLocale() {
        return this.locale
    }

    public getSyntaxLocale() {
        return this.syntaxLocale
    }

    public getAdminOnlyError(username:string) {
        return this.locale.errors.admin_only.replace(/(\${username})/g, username)
    }

    public getControllerOnlyError(username:string) {
        return this.locale.errors.controller_only.replace(/(\${username})/g, username)
    }

    public getGuildOnlyError(username:string) {
        return this.locale.errors.guild_only.replace(/(\${username})/g, username)
    }

    public getCommandNotReadyError(username:string) {
        return this.locale.errors.not_ready.replace(/(\${username})/g, username)
    }

    public getSystemComponents() {
        const components = [
            {
                "name": this.locale.systeminfo.cpu.title,
                "value": "cpu"
            }, {
                "name": this.locale.systeminfo.system.title,
                "value": "system"
            }, {
                "name": this.locale.systeminfo.memory.title,
                "value": "memory"
            }, {
                "name": this.locale.systeminfo.updates.title,
                "value": "updates"
            }
        ]

        for(const stateComponent in getEntry('state')) {
            if(/(mcu)/g.test(stateComponent) && !/(temperature_sensor)/g.test(stateComponent)) {
                components.push({
                    name: stateComponent.toUpperCase(),
                    value: stateComponent
                })
            }
        }

        return components
    }
}