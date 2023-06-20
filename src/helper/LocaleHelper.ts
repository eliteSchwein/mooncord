'use strict'

import {readFileSync} from 'fs'

import path from "path";
import {getEntry, setData, updateData} from "../utils/CacheUtil";
import {ConfigHelper} from "./ConfigHelper";
import {logRegular} from "./LoggerHelper";

export class LocaleHelper {
    protected config = new ConfigHelper()
    protected fallbackLocalePath = path.resolve(__dirname, '../locales/en.json')

    public constructor() {
    }

    public loadCache() {
        logRegular("load Locale Cache...")
        this.loadFallback()
        this.loadLocales()
    }

    public getLocale() {
        return getEntry('locale')
    }

    public getSyntaxLocale() {
        return getEntry('syntax_locale')
    }

    public getNoPermission(username: string) {
        return this.getLocale().messages.errors.no_permission.replace(/(\${username})/g, username)
    }

    public getGuildOnlyError(username: string) {
        return this.getLocale().messages.errors.guild_only.replace(/(\${username})/g, username)
    }

    public getCommandNotReadyError(username: string) {
        return this.getLocale().messages.errors.not_ready.replace(/(\${username})/g, username)
    }

    public getEmbeds() {
        return this.getLocale().embeds
    }

    public getModals() {
        return this.getLocale().modals
    }

    public getSystemComponents() {
        const components = [
            {
                "name": this.getLocale().embeds.system_update.title,
                "value": "updates"
            }
        ]

        for (const stateComponent in getEntry('state')) {
            if (/(mcu)/g.test(stateComponent) && !/(temperature_sensor)/g.test(stateComponent)) {
                components.push({
                    name: stateComponent.toUpperCase(),
                    value: stateComponent
                })
            }
        }

        return components
    }

    protected loadLocales() {
        const localeConfig = this.config.getLocale()
        const localePath = path.resolve(__dirname, `../locales/${localeConfig.locale}.json`)
        const syntaxLocalePath = path.resolve(__dirname, `../locales/${localeConfig.syntax}.json`)

        const localeRaw = readFileSync(localePath, {encoding: 'utf8'})
        const syntaxLocaleRaw = readFileSync(syntaxLocalePath, {encoding: 'utf8'})

        updateData('locale', JSON.parse(localeRaw))
        updateData('syntax_locale', JSON.parse(syntaxLocaleRaw))
    }

    protected loadFallback() {
        const fallbackLocaleRaw = readFileSync(this.fallbackLocalePath, {encoding: 'utf8'})

        setData('locale', JSON.parse(fallbackLocaleRaw))
        setData('syntax_locale', JSON.parse(fallbackLocaleRaw))
    }
}