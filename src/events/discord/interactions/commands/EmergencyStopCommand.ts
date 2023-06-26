'use strict'

import {CommandInteraction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class EmergencyStopCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'emergency_stop') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const moonrakerClient = getMoonrakerClient()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()

        await interaction.deferReply()

        void await moonrakerClient.send({"method": "printer.emergency_stop"})

        const answer = locale.messages.answers.emergency_stop
            .replace(/\${username}/g, interaction.user.tag)

        await interaction.editReply(answer)
    }
}