'use strict'

import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";

export class ExecuteCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'execute') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const databaseUtil = getDatabase()
        const configHelper = new ConfigHelper()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const embedHelper = new EmbedHelper()
        const modalHelper = new ModalHelper()
        const serviceHelper = new ServiceHelper()
        const consoleHelper = new ConsoleHelper()

        const gcodeArgument = interaction.options.getString(syntaxLocale.commands.execute.options.gcode.name)

        if (gcodeArgument === null) {
            const modal = await modalHelper.generateModal('execute_modal')
            await interaction.showModal(modal)
            return
        }

        await interaction.deferReply()

        const gcodeValid = await consoleHelper.executeGcodeCommands([gcodeArgument], interaction.channel)

        let answer = locale.messages.answers.execute_successful
            .replace(/\${username}/g, interaction.user.tag)

        if (gcodeValid === 0) {
            answer = locale.messages.errors.execute_failed
                .replace(/\${username}/g, interaction.user.tag)
        }

        if (gcodeValid === -1) {
            answer = locale.messages.errors.execute_running
                .replace(/\${username}/g, interaction.user.tag)
        }

        await interaction.editReply(answer)
    }
}