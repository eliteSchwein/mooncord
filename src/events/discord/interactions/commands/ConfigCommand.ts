import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction, Client} from "discord.js";
import {PageHelper} from "../../../../helper/PageHelper";
import {uploadAttachment} from "../../../../helper/DataHelper";

export default class ConfigCommand extends BaseCommand {
    commandId = 'config'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        if (interaction.options.getSubcommand() === this.syntaxLocale.commands.config.options.get.name) {
            const pageHelper = new PageHelper('configs_download')
            const pageData = await pageHelper.getPage(false, 2)

            if (!pageData) {
                await interaction.editReply(this.locale.messages.errors.no_configs
                    .replace(/(\${username})/g, interaction.user.tag))
                return
            }

            await interaction.editReply(pageData.embed)

            return
        }

        if (interaction.options.getSubcommand() === this.syntaxLocale.commands.config.options.upload.name) {
            await this.uploadConfiguration(interaction)
            return
        }
    }

    private async uploadConfiguration(interaction: ChatInputCommandInteraction) {
        const attachment = interaction.options.getAttachment(this.syntaxLocale.commands.config.options.upload.options.file.name)
        let directory: string | null = interaction.options.getString(this.syntaxLocale.commands.config.options.upload.options.directory.name)

        if (directory === null) {
            directory = ''
        }

        const uploadRequest = await uploadAttachment(attachment, 'config', directory)

        if (uploadRequest) {
            await interaction.editReply(this.locale.messages.answers.upload_successful
                .replace(/(\${filename})/g, attachment.name)
                .replace(/(\${username})/g, interaction.user.tag))
            const serviceRestart = await this.serviceHelper.restartServiceByFile(attachment.name)

            if (serviceRestart) {
                await interaction.followUp(this.locale.messages.answers.restart_successful
                    .replace(/(\${service})/g, serviceRestart)
                    .replace(/(\${username})/g, interaction.user.tag))
            }
            return
        }

        await interaction.editReply(this.locale.messages.errors.upload_failed
            .replace(/(\${filename})/g, attachment.name)
            .replace(/(\${username})/g, interaction.user.tag))
    }
}