'use strict'

import {CommandInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {uploadAttachment} from "../../../../helper/DataHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";

export class ConfigCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'config') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const localeHelper = new LocaleHelper()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const embedHelper = new EmbedHelper()

        await interaction.deferReply()

        if (interaction.options.getSubcommand() === syntaxLocale.commands.config.options.get.name) {
            const pageHelper = new PageHelper('configs_download')
            const pageData = pageHelper.getPage(false, 2)

            if (Object.keys(pageData).length === 0) {
                await interaction.editReply(localeHelper.getCommandNotReadyError(interaction.user.username))
                return
            }

            const embed = await embedHelper.generateEmbed('configs_download', pageData)

            await interaction.editReply(embed.embed)

            return
        }

        if (interaction.options.getSubcommand() === syntaxLocale.commands.config.options.upload.name) {
            await this.uploadConfiguration(interaction)
            return
        }
    }

    protected async uploadConfiguration(interaction: CommandInteraction) {
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const serviceHelper = new ServiceHelper()

        const attachment = interaction.options.getAttachment(syntaxLocale.commands.config.options.upload.options.file.name)
        let directory: string | null = interaction.options.getString(syntaxLocale.commands.config.options.upload.options.directory.name)

        if (directory === null) {
            directory = ''
        }

        const uploadRequest = await uploadAttachment(attachment, 'config', directory)

        if (uploadRequest) {
            await interaction.editReply(locale.messages.answers.upload_successful
                .replace(/(\${filename})/g, attachment.name)
                .replace(/(\${username})/g, interaction.user.tag))
            const serviceRestart = await serviceHelper.restartServiceByFile(attachment.name)

            if (serviceRestart) {
                await interaction.followUp(locale.messages.answers.restart_successful
                    .replace(/(\${service})/g, serviceRestart)
                    .replace(/(\${username})/g, interaction.user.tag))
            }
            return
        }

        await interaction.editReply(locale.messages.errors.upload_failed
            .replace(/(\${filename})/g, attachment.name)
            .replace(/(\${username})/g, interaction.user.tag))
    }
}