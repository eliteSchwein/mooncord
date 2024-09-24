import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class TempCommand extends BaseCommand {
    commandId = 'temp'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const message = await this.embedHelper.generateEmbed('temperatures')

        await interaction.editReply(message.embed)
    }
}