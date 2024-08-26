'use strict'

import {Message, MessageAttachment, MessageEmbed, SelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {findValueByPartial, formatTime} from "../../../../helper/DataHelper";
import axios from "axios";
import {logError, logSuccess} from "../../../../helper/LoggerHelper";
import util from "util";

export class DownloadLogSelection {
    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'loglist_download_log') {
            return
        }

        void this.execute(interaction)
    }

    private async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply({ephemeral: true})

        let attachments = []

        for (const value of interaction.values) {
            const attachment = await this.retrieveLog(value)

            if(typeof attachment === 'string') {
                await interaction.editReply(attachment);
                return
            }

            attachments.push(attachment)
        }

        try {
            await interaction.editReply({files: attachments});
        } catch (error) {
            const localeHelper = new LocaleHelper()
            const locale = localeHelper.getLocale()
            const formattedError = util.format(error)

            await interaction.editReply(locale.messages.errors.log_failed
                .replace(/(\${service})/g, 'N/A')
                .replace(/(\${reason})/g, `\`\`js\n${formattedError}\`\``));
            logError(`Logs Upload failed! Reason: ${util.format(formattedError)}`)
        }
    }

    private async retrieveLog(logFile: string) {
        const config = new ConfigHelper()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()

        try {
            const result = await axios.get(`${config.getMoonrakerUrl()}/server/files/logs/${logFile}`, {
                responseType: 'arraybuffer',
                headers: {
                    'X-Api-Key': config.getMoonrakerApiKey()
                }
            })

            const bufferSize = Buffer.byteLength(<Buffer>result.data)

            if (bufferSize > Number.parseInt('25000000')) {
                logError(`${logFile} Log to big, Logfile: ${bufferSize}byte Limit: 25mb`)
                return locale.messages.errors.log_too_large
                    .replace(/(\${service})/g, `\`${logFile}\``)
            }

            const attachment = new MessageAttachment(<Buffer>result.data, `${logFile}.log`)

            logSuccess(`${logFile} Log Download successful!`)
            return attachment
        } catch (error) {
            if (typeof error.code !== 'undefined') {
                logError(`${logFile} Log Download failed: ${error.config.url}: ${error.code}`)
                return locale.messages.errors.log_failed
                    .replace(/(\${service})/g, logFile)
                    .replace(/(\${reason})/g, `${error.code}`)
            }
            logError(`${logFile} Log Download failed: ${error.config.url}: ${error.response.status} ${error.response.statusText}`)
            if (error.response.status === 404) {
                return locale.messages.errors.log_not_found
                    .replace(/(\${service})/g, logFile)
            }
            return locale.messages.errors.log_failed
                .replace(/(\${service})/g, logFile)
                .replace(/(\${reason})/g, `${error.response.status} ${error.response.statusText}`)
        }
    }
}