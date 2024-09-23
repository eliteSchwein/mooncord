'use strict'

import {Message, User} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import BaseHandler from "./BaseHandler";

export class MacroHandler extends BaseHandler{
    async isValid(message: Message, user: User, data, interaction = null) {
        if (typeof data.macros === 'undefined') {
            return false
        }
        if (data.macros.empty) {
            return false
        }

        return true
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        const gcodeValid = await this.consoleHelper.executeGcodeCommands(data.macros,
            interaction.channel,
            data.macro_message === true)

        if (!data.macro_message) {
            return
        }

        let label = data.label

        if (typeof data.emoji !== 'undefined') {
            label = `${data.emoji} ${label}`
        }

        let answer = this.locale.messages.answers.macros_executed
            .replace(/\${username}/g, interaction.user.tag)
            .replace(/(\${button_label})/g, label)

        if (gcodeValid === 0) {
            answer = this.locale.messages.errors.macros_failed
                .replace(/\${username}/g, interaction.user.tag)
                .replace(/(\${button_label})/g, label)
        }

        if (gcodeValid === -1) {
            answer = this.locale.messages.errors.execute_running
                .replace(/\${username}/g, interaction.user.tag)
        }

        if (interaction !== null && interaction.replied) {
            await interaction.followUp({ephemeral: false, content: answer})
        } else {
            await interaction.reply(answer)
        }
    }
}