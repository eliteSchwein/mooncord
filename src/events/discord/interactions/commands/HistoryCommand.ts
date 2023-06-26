'use strict'

import {CommandInteraction} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {HistoryHelper} from "../../../../helper/HistoryHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {getEntry} from "../../../../utils/CacheUtil";

export class HistoryCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'history') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const embedHelper = new EmbedHelper()
        const historyHelper = new HistoryHelper()
        const localeHelper = new LocaleHelper()

        const serverComponents = getEntry('server_info').components

        if (!serverComponents.includes('history')) {
            await interaction.reply(localeHelper.getCommandNotReadyError(interaction.user.username))
            return
        }

        await interaction.deferReply()
        const printStats = historyHelper.getPrintStats()

        if (printStats.count === 0) {
            await interaction.editReply(localeHelper.getCommandNotReadyError(interaction.user.username))
            return
        }

        const message = await embedHelper.generateEmbed('history')

        void interaction.editReply(message.embed)
    }

}