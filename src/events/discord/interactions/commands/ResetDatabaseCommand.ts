import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class ResetDatabaseCommand extends BaseCommand {
    commandId = 'reset_database'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        await this.database.resetDatabase()

        await interaction.editReply(this.locale.messages.answers.reset_database)
    }
}