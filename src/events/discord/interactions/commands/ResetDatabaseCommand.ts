import {CommandInteraction, Interaction, MessageAttachment} from "discord.js";
import { dump } from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class ResetDatabaseCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'reset_database') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply()

        void await this.databaseUtil.resetDatabase()

        await interaction.editReply(this.locale.messages.answers.reset_database)
    }
}