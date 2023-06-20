'use strict'

import {CommandInteraction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class EmergencyStopCommand {
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'emergency_stop') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply()

        void await this.moonrakerClient.send({"method": "printer.emergency_stop"})

        const answer = this.locale.messages.answers.emergency_stop
            .replace(/\${username}/g, interaction.user.tag)

        await interaction.editReply(answer)
    }
}