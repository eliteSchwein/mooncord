import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {HistoryHelper} from "../../../../helper/HistoryHelper";

export default class HistoryCommand extends BaseCommand {
    commandId = 'history'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const historyHelper = new HistoryHelper()

        const serverComponents = getEntry('server_info').components

        if (!serverComponents.includes('history')) {
            await interaction.reply(this.locale.messages.errors.no_history
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        await interaction.deferReply()
        const printStats = historyHelper.getPrintStats()

        if (printStats.count === 0) {
            await interaction.editReply(this.locale.messages.errors.no_history
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        const message = await this.embedHelper.generateEmbed('history')

        void interaction.editReply(message.embed)
    }
}