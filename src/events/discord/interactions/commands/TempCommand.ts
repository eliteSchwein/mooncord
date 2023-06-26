'use strict'

import {CommandInteraction} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {TempHelper} from "../../../../helper/TempHelper";

export class TempCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'temp') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        const embedHelper = new EmbedHelper()

        const message = await embedHelper.generateEmbed('temperatures')

        await interaction.editReply(message.embed)
    }

}