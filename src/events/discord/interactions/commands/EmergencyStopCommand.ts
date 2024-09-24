import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class EmergencyStopCommand extends BaseCommand {
    commandId = 'emergency_stop'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        void await this.moonrakerClient.send({"method": "printer.emergency_stop"})

        const answer = this.locale.messages.answers.emergency_stop
            .replace(/\${username}/g, interaction.user.tag)

        await interaction.editReply(answer)
    }
}