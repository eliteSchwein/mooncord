'use strict'

import {MessageAttachment, SelectMenuInteraction} from "discord.js";
import {logError, logRegular, logSuccess} from "../../../../helper/LoggerHelper";
import axios from "axios";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {downloadFile} from "../../../../helper/DataHelper";

export class DownloadConfig {

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'config_file_download') {
            return
        }

        void this.execute(interaction)
    }

    private async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply({ephemeral: true})

        const file = interaction.values[0]

        await interaction.editReply(await this.retrieveConfig(file))
    }

    private async retrieveConfig(config: string) {
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()

        logRegular(`downloading config for ${config}...`)

        try {
            const result = await downloadFile("config", config)

            if (result.size > Number.parseInt('8000000')) {
                logError(`Configuration ${config} to big, Configfile: ${result.size}byte Limit: 8000000byte`)
                return locale.messages.errors.config_too_large
                    .replace(/(\${config})/g, `\`${config}\``)
            }

            const attachment = new MessageAttachment(result.data, `${config}`)

            logSuccess(`Configuration ${config} Download successful!`)
            return {files: [attachment]}
        } catch (error) {
            if (typeof error.code !== 'undefined') {
                logError(`${config} Config Download failed: ${error.config.url}: ${error.code}`)
                return locale.messages.errors.config_failed
                    .replace(/(\${config})/g, config)
                    .replace(/(\${reason})/g, `${error.code}`)
            }
            logError(`${config} Config Download failed: ${error.config.url}: ${error.response.status} ${error.response.statusText}`)
            if (error.response.status === 404) {
                return locale.messages.errors.config_not_found
                    .replace(/(\${config})/g, config)
            }
            return locale.messages.errors.config_failed
                .replace(/(\${config})/g, config)
                .replace(/(\${reason})/g, `${error.response.status} ${error.response.statusText}`)
        }
    }
}