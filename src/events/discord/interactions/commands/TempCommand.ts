import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class TempCommand extends BaseCommand {
    commandId = 'temp'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()

        const message = await this.embedHelper.generateEmbed('temperatures')

        await interaction.editReply(message.embed)
    }
}