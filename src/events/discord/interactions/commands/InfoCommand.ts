'use strict'

import {CommandInteraction} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class InfoCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'info') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const message = await new EmbedHelper().generateEmbed('info')

        void interaction.reply(message.embed)
    }

}