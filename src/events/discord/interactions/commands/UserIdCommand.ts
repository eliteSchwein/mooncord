'use strict'

import {CommandInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class UserIdCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'get_user_id') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const localeHelper = new LocaleHelper()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const locale = localeHelper.getLocale()

        const userArgument = interaction.options.getUser(syntaxLocale.commands.get_user_id.options.user.name)

        let answer

        if (userArgument === null) {
            answer = locale.messages.answers.user_id.own_id
                .replace(/\${id}/g, interaction.user.id)
        } else {
            answer = locale.messages.answers.user_id.other_id
                .replace(/\${id}/g, userArgument.id)
                .replace(/\${username}/g, userArgument.tag)
        }

        void interaction.reply(answer)
    }
}