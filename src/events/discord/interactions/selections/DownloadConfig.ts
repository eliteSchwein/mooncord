'use strict'

import {AttachmentBuilder, MessageFlagsBitField, StringSelectMenuInteraction} from "discord.js";
import {logError, logRegular, logSuccess} from "../../../../helper/LoggerHelper";
import BaseSelection from "../abstracts/BaseSelection";
import {downloadFile} from "../../../../utils/FileUtil";

export class DownloadConfig extends BaseSelection {
    selectionId = 'config_file_download'
    ephemeral = true

    async handleSelection(interaction: StringSelectMenuInteraction) {
        let firstMessage = true

        for (const value of interaction.values) {
            const attachment = await this.retrieveConfig(value)

            if (typeof attachment === 'string') {
                if(firstMessage) {
                    await interaction.editReply(attachment);
                    firstMessage = false
                }

                await interaction.followUp({
                    content: attachment,
                    flags: MessageFlagsBitField.Flags.Ephemeral
                })

                continue
            }

            if(firstMessage) {
                await interaction.editReply({
                    files: [attachment]
                })
                firstMessage = false
                continue
            }

            await interaction.followUp({
                files: [attachment],
                flags: MessageFlagsBitField.Flags.Ephemeral
            })
        }
    }

    private async retrieveConfig(config: string) {
        logRegular(`downloading config for ${config}...`)

        try {
            const result = await downloadFile("config", config)

            if (result.overSizeLimit) {
                logError(`Configuration ${config} to big, Configfile: ${result.size}byte Limit: 8000000byte`)
                return this.locale.messages.errors.config_too_large
                    .replace(/(\${config})/g, `\`${config}\``)
            }

            const attachment = new AttachmentBuilder(result.data, {name: `${config}`})

            logSuccess(`Configuration ${config} Download successful!`)
            return attachment
        } catch (error) {
            if (typeof error.code !== 'undefined') {
                logError(`${config} Config Download failed: ${error.config.url}: ${error.code}`)
                return this.locale.messages.errors.config_failed
                    .replace(/(\${config})/g, config)
                    .replace(/(\${reason})/g, `${error.code}`)
            }
            logError(`${config} Config Download failed: ${error.config.url}: ${error.response.status} ${error.response.statusText}`)
            if (error.response.status === 404) {
                return this.locale.messages.errors.config_not_found
                    .replace(/(\${config})/g, config)
            }
            return this.locale.messages.errors.config_failed
                .replace(/(\${config})/g, config)
                .replace(/(\${reason})/g, `${error.response.status} ${error.response.statusText}`)
        }
    }
}