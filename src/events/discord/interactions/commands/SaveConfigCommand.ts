'use strict'

import {CommandInteraction} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logRegular} from "../../../../helper/LoggerHelper";

export class SaveConfigCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected locale = this.localeHelper.getLocale()
    protected moonrakerClient = getMoonrakerClient()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'saveconfig') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply()

        logRegular('saving configuration...')

        await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `SAVE_CONFIG`}})

        await interaction.editReply(this.locale.messages.answers.config_save
            .replace(/(\${username})/g, interaction.user.tag))
    }
}