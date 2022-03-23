import {CommandInteraction, MessageAttachment} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class TuneCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'tune') { return }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const speed = interaction.options.getInteger(this.syntaxLocale.commands.tune.options.speed.name)
        const flow = interaction.options.getInteger(this.syntaxLocale.commands.tune.options.flow.name)

        if(speed === null && flow === null) {
            await interaction.reply(this.locale.messages.errors.missing_arguments
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }
    }
}