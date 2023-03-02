import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class TimelapseListCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected embedHelper = new EmbedHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'listtimelapses') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply()

        const pageHelper = new PageHelper('timelapse_files')
        const pageData = pageHelper.getPage(false, 2)

        if (Object.keys(pageData) === undefined || Object.keys(pageData).length === 0) {
            await interaction.editReply(this.localeHelper.getCommandNotReadyError(interaction.user.username))
            return
        }

        const embed = await this.embedHelper.generateEmbed('timelapse_files', pageData)

        await interaction.editReply(embed.embed)
    }
}