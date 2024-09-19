import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";

export default class UserIdCommand extends BaseCommand {
    commandId = 'get_user_id'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const userArgument = interaction.options.getUser(this.syntaxLocale.commands.get_user_id.options.user.name)

        let answer

        if (userArgument === null) {
            answer = this.locale.messages.answers.user_id.own_id
                .replace(/\${id}/g, interaction.user.id)
        } else {
            answer = this.locale.messages.answers.user_id.other_id
                .replace(/\${id}/g, userArgument.id)
                .replace(/\${username}/g, userArgument.tag)
        }

        void interaction.reply(answer)
    }
}