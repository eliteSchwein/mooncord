import {CommandInteraction, MessageAttachment} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {getConfigFiles} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class ConfigCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected embedHelper = new EmbedHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'config') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply()

        if(interaction.options.getSubcommand(this.syntaxLocale.commands.config.options.get.name)) {
            // @ts-ignore
            const pageHelper = new PageHelper('configs_download')
            const pageData = pageHelper.getPage(false, 1)

            const embed = await this.embedHelper.generateEmbed('configs_download', pageData)

            await interaction.editReply(embed.embed)

            return
        }
    }
}