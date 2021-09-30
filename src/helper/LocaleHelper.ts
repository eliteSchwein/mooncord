import {readFileSync} from 'fs'

import {ConfigHelper} from "./ConfigHelper";
import path from "path";

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
}