import {CommandInteraction, MessageAttachment} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DiscordCommandGenerator} from "../../../../generator/DiscordCommandGenerator";

export class CustomCommand {
    protected commandGenerator = new DiscordCommandGenerator()
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(!this.commandGenerator.isCustomCommand(commandId)) { return }

        this.execute(interaction, commandId)
    }

    protected async execute(interaction: CommandInteraction, commandId: string) {
        const customCommandData = this.commandGenerator.getCustomCommandData(commandId)
        console.log(customCommandData)
        await interaction.reply(JSON.stringify(customCommandData))
    }
}