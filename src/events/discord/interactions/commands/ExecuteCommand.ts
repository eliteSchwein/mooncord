import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class ExecuteCommand extends BaseCommand {
    commandId = 'execute'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const gcodeArgument = interaction.options.getString(this.syntaxLocale.commands.execute.options.gcode.name)

        if (gcodeArgument === null) {
            const modal = await this.modalHelper.generateModal('execute_modal')
            await interaction.showModal(modal)
            return
        }

        await interaction.deferReply()

        const gcodeValid = await this.consoleHelper.executeGcodeCommands([gcodeArgument], interaction.channel)

        let answer = this.locale.messages.answers.execute_successful
            .replace(/\${username}/g, interaction.user.tag)

        if (gcodeValid === 0) {
            answer = this.locale.messages.errors.execute_failed
                .replace(/\${username}/g, interaction.user.tag)
        }

        if (gcodeValid === -1) {
            answer = this.locale.messages.errors.execute_running
                .replace(/\${username}/g, interaction.user.tag)
        }

        await interaction.editReply(answer)
    }
}