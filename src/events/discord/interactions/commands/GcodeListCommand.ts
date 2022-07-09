import {CommandInteraction, MessageAttachment} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {getEntry} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class GcodeListCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected embedHelper = new EmbedHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'listgcodes') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply()

        const pageHelper = new PageHelper(getEntry('gcode_files'), 'gcode_files')
        const pageData = pageHelper.getPage(false, 1)

        const embed = await this.embedHelper.generateEmbed('gcode_files', pageData)

        await interaction.editReply(embed.embed)
    }
}