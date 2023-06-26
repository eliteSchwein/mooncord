'use strict'

import {Message, User} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";

export class MacroHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (typeof data.macros === 'undefined') {
            return
        }
        if (data.macros.empty) {
            return
        }

        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const consoleHelper = new ConsoleHelper()

        const gcodeValid = await consoleHelper.executeGcodeCommands(data.macros,
            interaction.channel,
            data.macro_message === true)

        if (!data.macro_message) {
            return
        }

        let label = data.label

        if (typeof data.emoji !== 'undefined') {
            label = `${data.emoji} ${label}`
        }

        let answer = locale.messages.answers.macros_executed
            .replace(/\${username}/g, interaction.user.tag)
            .replace(/(\${button_label})/g, label)

        if (gcodeValid === 0) {
            answer = locale.messages.errors.macros_failed
                .replace(/\${username}/g, interaction.user.tag)
                .replace(/(\${button_label})/g, label)
        }

        if (gcodeValid === -1) {
            answer = locale.messages.errors.execute_running
                .replace(/\${username}/g, interaction.user.tag)
        }

        if (interaction !== null && interaction.replied) {
            await interaction.followUp({ephemeral: false, content: answer})
        } else {
            await message.reply(answer)
        }
    }
}