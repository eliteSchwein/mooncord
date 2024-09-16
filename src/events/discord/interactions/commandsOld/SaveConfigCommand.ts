'use strict'

import {CommandInteraction} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logRegular} from "../../../../helper/LoggerHelper";

export class SaveConfigCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'saveconfig') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const moonrakerClient = getMoonrakerClient()

        logRegular('saving configuration...')

        await moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `SAVE_CONFIG`}})

        await interaction.editReply(locale.messages.answers.config_save
            .replace(/(\${username})/g, interaction.user.tag))
    }
}