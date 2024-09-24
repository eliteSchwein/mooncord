'use strict'

import {AttachmentBuilder, Message, StringSelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {downloadFile, findValueByPartial, formatTime} from "../../../../helper/DataHelper";
import axios from "axios";
import {logError, logSuccess} from "../../../../helper/LoggerHelper";
import util from "util";
import BaseSelection from "../abstracts/BaseSelection";

export class DownloadLogSelection extends BaseSelection {
    selectionId = 'loglist_download_log'
    ephemeral = true

    async handleSelection(interaction: StringSelectMenuInteraction) {
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
            const formattedError = util.format(error)

            await interaction.editReply(this.locale.messages.errors.log_failed
                .replace(/(\${service})/g, 'N/A')
                .replace(/(\${reason})/g, `\`\`js\n${formattedError}\`\``));
            logError(`Logs Upload failed! Reason: ${util.format(formattedError)}`)
        }
    }

    private async retrieveLog(logFile: string) {
        try {
            const result = await downloadFile("logs", logFile)

            if (result.overSizeLimit) {
                logError(`${logFile} Log to big, Logfile: ${result.size}byte Limit: ${result.sizeLimit / 1000000}mb`)
                return this.locale.messages.errors.log_too_large
                    .replace(/(\${service})/g, `\`${logFile}\``)
            }

            const attachment = new AttachmentBuilder(result.data, {name: `${logFile}.log`})

            logSuccess(`${logFile} Log Download successful!`)
            return attachment
        } catch (error) {
            if (typeof error.code !== 'undefined') {
                logError(`${logFile} Log Download failed: ${error.config.url}: ${error.code}`)
                return this.locale.messages.errors.log_failed
                    .replace(/(\${service})/g, logFile)
                    .replace(/(\${reason})/g, `${error.code}`)
            }
            logError(`${logFile} Log Download failed: ${error.config.url}: ${error.response.status} ${error.response.statusText}`)
            if (error.response.status === 404) {
                return this.locale.messages.errors.log_not_found
                    .replace(/(\${service})/g, logFile)
            }
            return this.locale.messages.errors.log_failed
                .replace(/(\${service})/g, logFile)
                .replace(/(\${reason})/g, `${error.response.status} ${error.response.statusText}`)
        }
    }
}