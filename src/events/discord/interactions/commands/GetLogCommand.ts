'use strict'

import {CommandInteraction, MessageAttachment} from "discord.js";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import axios from "axios";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logError, logSuccess} from "../../../../helper/LoggerHelper";
import {getEntry} from "../../../../utils/CacheUtil";

export class GetLodCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'get_log') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const localeHelper = new LocaleHelper()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        await interaction.deferReply({ephemeral: true})

        const service = interaction.options.getString(syntaxLocale.commands.get_log.options.log_file.name)

        let request: any

        if (service === 'mooncord') {
            request = await this.readMoonCordLog()
        } else {
            request = await this.retrieveServiceLog(service)
        }

        await interaction.editReply(request)
    }

    private async readMoonCordLog() {
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()

        try {
            const logPath = getEntry('function').log_path

            const attachment = new MessageAttachment(logPath, 'mooncord.log')

            logSuccess(`MoonCord Log read successful!`)

            return {files: [attachment]}
        } catch (e) {
            return locale.messages.errors.log_failed
                .replace(/(\${service})/g, 'MoonCord')
                .replace(/(\${reason})/g, `${e}`)
        }
    }

    private async retrieveServiceLog(service: string) {
        const config = new ConfigHelper()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()

        try {
            const result = await axios.get(`${config.getMoonrakerUrl()}/server/files/${service}.log`, {
                responseType: 'arraybuffer',
                headers: {
                    'X-Api-Key': config.getMoonrakerApiKey()
                }
            })

            const bufferSize = Buffer.byteLength(<Buffer>result.data)

            if (bufferSize > Number.parseInt('25000000')) {
                logError(`${service} Log to big, Logfile: ${bufferSize}byte Limit: 25mb`)
                return locale.messages.errors.log_too_large
                    .replace(/(\${service})/g, `\`${service}\``)
            }

            const attachment = new MessageAttachment(<Buffer>result.data, `${service}.log`)

            logSuccess(`${service} Log Download successful!`)
            return {files: [attachment]}
        } catch (error) {
            if (typeof error.code !== 'undefined') {
                logError(`${service} Log Download failed: ${error.config.url}: ${error.code}`)
                return locale.messages.errors.log_failed
                    .replace(/(\${service})/g, service)
                    .replace(/(\${reason})/g, `${error.code}`)
            }
            logError(`${service} Log Download failed: ${error.config.url}: ${error.response.status} ${error.response.statusText}`)
            if (error.response.status === 404) {
                return locale.messages.errors.log_not_found
                    .replace(/(\${service})/g, service)
            }
            return locale.messages.errors.log_failed
                .replace(/(\${service})/g, service)
                .replace(/(\${reason})/g, `${error.response.status} ${error.response.statusText}`)
        }
    }
}