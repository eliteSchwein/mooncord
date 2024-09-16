'use strict'

import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {getEntry} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";

export class StatusCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'status') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        const embedHelper = new EmbedHelper()
        const configHelper = new ConfigHelper()

        const functionCache = getEntry('function')

        const currentStatus = functionCache.current_status
        const currentStatusMeta = configHelper.getStatusMeta()[currentStatus]

        const message = await embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await interaction.editReply(message.embed)
    }
}