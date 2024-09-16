'use strict'

import {CommandInteraction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DiscordCommandGenerator} from "../../../../generator/DiscordCommandGenerator";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import {logRegular, logWarn} from "../../../../helper/LoggerHelper";

export class CustomCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        const commandGenerator = new DiscordCommandGenerator()

        if (!commandGenerator.isCustomCommand(commandId)) {
            return
        }

        this.execute(interaction, commandId)
    }

    private async execute(interaction: CommandInteraction, commandId: string) {
        const commandGenerator = new DiscordCommandGenerator()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const consoleHelper = new ConsoleHelper()
        const moonrakerClient = getMoonrakerClient()

        const customCommandData = commandGenerator.getCustomCommandData(commandId)

        await interaction.deferReply()

        if (customCommandData.macros !== undefined) {
            await consoleHelper.executeGcodeCommands(customCommandData.macros,
                interaction.channel)
        }

        if (customCommandData.websocket_commands !== undefined) {
            for (const websocketCommand of customCommandData.websocket_commands) {
                logRegular(`Execute Websocket Command ${websocketCommand}...`)
                try {
                    await moonrakerClient.send(websocketCommand)
                } catch {
                    logWarn(`The Websocket Command ${websocketCommand} timed out...`)
                }
            }
        }

        await interaction.editReply(locale.messages.answers.custom_command_executed
            .replace(/\${username}/g, interaction.user.tag)
            .replace(/\${custom_command}/g, commandId))
    }
}