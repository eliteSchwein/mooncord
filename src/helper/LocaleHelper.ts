import {readFileSync} from 'fs'

import {ConfigHelper} from "./ConfigHelper";
import path from "path";
import {getEntry} from "../utils/CacheUtil";

export class LocaleHelper {
    protected config = new ConfigHelper()
    protected localePath = path.resolve(__dirname, `../locales/${this.config.getLocale()}.json`)
    protected syntaxLocalePath = path.resolve(__dirname, `../locales/${this.config.getSyntaxLocale()}.json`)
    protected locale: any
    protected syntaxLocale: any

    public constructor() {
        const localeRaw = readFileSync(this.localePath, {encoding: 'utf8'})
        const syntaxLocaleRaw  = readFileSync(this.syntaxLocalePath, {encoding: 'utf8'})

        this.locale = JSON.parse(localeRaw)
        this.syntaxLocale = JSON.parse(syntaxLocaleRaw)
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