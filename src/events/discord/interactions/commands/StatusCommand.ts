import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";

export default class StatusCommand extends BaseCommand {
    commandId = 'status'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()

        const functionCache = getEntry('function')

        const currentStatus = functionCache.current_status
        const currentStatusMeta = this.config.getStatusMeta()[currentStatus]

        const message = await this.embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await interaction.editReply(message.embed)
    }
}