import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {uploadAttachment} from "../../../../helper/DataHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";

export class ConfigCommand {
    protected databaseUtil = getDatabase()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected embedHelper = new EmbedHelper()
    protected modalHelper = new ModalHelper()
    protected serviceHelper = new ServiceHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'config') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {

        await interaction.deferReply()

        if (interaction.options.getSubcommand() === this.syntaxLocale.commands.config.options.get.name) {
            const pageHelper = new PageHelper('configs_download')
            const pageData = pageHelper.getPage(false, 1)

            if (Object.keys(pageData).length === 0) {
                await interaction.editReply(this.localeHelper.getCommandNotReadyError(interaction.user.username))
                return
            }

            const embed = await this.embedHelper.generateEmbed('configs_download', pageData)

            await interaction.editReply(embed.embed)

            return
        }

        if (interaction.options.getSubcommand() === this.syntaxLocale.commands.config.options.upload.name) {
            await this.uploadConfiguration(interaction)
            return
        }
    }

    protected async uploadConfiguration(interaction: CommandInteraction) {
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