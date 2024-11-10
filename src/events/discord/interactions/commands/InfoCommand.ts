import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export default class InfoCommand extends BaseCommand {
    commandId = 'info'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const message = await new EmbedHelper().generateEmbed('info')

        await interaction.editReply(message.embed)
    }
}