import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class SystemInfoCommand extends BaseCommand {
    commandId = 'systeminfo';

    async handleCommand(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()

        const embed = await this.embedHelper.generateEmbed('systeminfo_cpu')

        await interaction.editReply(embed.embed)
    }
}