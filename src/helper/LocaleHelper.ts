'use strict'

import {readFileSync} from 'fs'

import path from "path";
import {getEntry, setData, updateData} from "../utils/CacheUtil";
import {ConfigHelper} from "./ConfigHelper";
import {logRegular} from "./LoggerHelper";
import {get} from "lodash";

export class LocaleHelper {
    public constructor() {
    }

    public loadCache() {
        logRegular("load Locale Cache...")
        this.loadLocales()
    }

    public getLocale() {
        return this.loadLocales().locale
    }

    public getSyntaxLocale() {
        return this.loadLocales().syntax_locale
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

    public getMessageById(placeholderId: string) {
        if(placeholderId.startsWith("locale")) {
            return `${get(this.getLocale(), placeholderId.replace('locale.', ''))}`
        }

        if(placeholderId.startsWith("syntax_locale")) {
            return `${get(this.getSyntaxLocale(), placeholderId.replace('syntax_locale.', ''))}`
        }
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

    public loadLocales() {
        const localeConfig = new ConfigHelper().getLocale()
        const localePath = path.resolve(__dirname, `../locales/${localeConfig.locale}.json`)
        const syntaxLocalePath = path.resolve(__dirname, `../locales/${localeConfig.syntax}.json`)

        const fallbackLocaleRaw =readFileSync(path.resolve(__dirname, '../locales/en.json'), {encoding: 'utf8'})

        let localeRaw = readFileSync(localePath, {encoding: 'utf8'})
        let syntaxLocaleRaw = readFileSync(syntaxLocalePath, {encoding: 'utf8'})

        if(!localeRaw) localeRaw = fallbackLocaleRaw
        if(!syntaxLocaleRaw) syntaxLocaleRaw = fallbackLocaleRaw

        //updateData('locale', JSON.parse(localeRaw))
        //updateData('syntax_locale', JSON.parse(syntaxLocaleRaw))

        return {
            locale: JSON.parse(localeRaw),
            syntax_locale: JSON.parse(syntaxLocaleRaw),
        }
    }
}