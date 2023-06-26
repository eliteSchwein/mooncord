'use strict'

import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class SystemInfoCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'systeminfo') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        const embedHelper = new EmbedHelper()

        const embed = await embedHelper.generateEmbed('systeminfo_cpu')

        await interaction.editReply(embed.embed)
    }
}