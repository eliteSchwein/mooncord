import {CommandInteraction, MessageAttachment} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class GetConfigCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'getconfig') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ephemeral: true})

        const configArgument = interaction.options.getString(this.syntaxLocale.commands.getconfig.options.file.name)

        console.log(CacheUtil.getConfigChoices())
    }
}