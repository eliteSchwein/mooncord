import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {HistoryHelper} from "../../../../helper/HistoryHelper";
import {PageHelper} from "../../../../helper/PageHelper";

export default class HistoryCommand extends BaseCommand {
    commandId = 'history'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const historyHelper = new HistoryHelper()

        const serverComponents = getEntry('server_info').components

        if (!serverComponents.includes('history')) {
            await interaction.editReply(this.locale.messages.errors.no_history
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        const printStats = historyHelper.getPrintStats()

        if (printStats.count === 0) {
            await interaction.editReply(this.locale.messages.errors.no_history
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        const pageHelper = new PageHelper('history')
        const pageData = await pageHelper.getPage(false, 2)

        if (!pageData) {
            await interaction.editReply(this.locale.messages.errors.no_history
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        if(pageData.embed) {
            await interaction.editReply(pageData.embed)
            return
        }

        const embed = await this.embedHelper.generateEmbed('history', pageData)

        await interaction.editReply(embed.embed)
    }
}