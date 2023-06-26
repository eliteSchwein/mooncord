'use strict'

import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class ResetDatabaseCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'reset_database') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        const databaseUtil = getDatabase()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()

        await databaseUtil.resetDatabase()

        await interaction.editReply(locale.messages.answers.reset_database)
    }
}