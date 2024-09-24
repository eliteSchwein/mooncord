import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {DiscordCommandGenerator} from "../../../../generator/DiscordCommandGenerator";
import {logRegular, logWarn} from "../../../../helper/LoggerHelper";

export default class CustomCommand extends BaseCommand {
    protected commandGenerator = new DiscordCommandGenerator()

    public constructor(interaction: ChatInputCommandInteraction, commandId: string) {
        super(interaction, commandId)

        if (!this.commandGenerator.isCustomCommand(commandId)) {
            return
        }

        void this.handleCustomCommand(interaction, commandId)
    }


    async handleCustomCommand(interaction: ChatInputCommandInteraction, commandId: string) {
        const customCommandData = this.commandGenerator.getCustomCommandData(commandId)

        if (customCommandData.macros !== undefined) {
            await this.consoleHelper.executeGcodeCommands(customCommandData.macros,
                interaction.channel)
        }

        if (customCommandData.websocket_commands !== undefined) {
            for (const websocketCommand of customCommandData.websocket_commands) {
                logRegular(`Execute Websocket Command ${websocketCommand}...`)
                try {
                    await this.moonrakerClient.send(websocketCommand)
                } catch {
                    logWarn(`The Websocket Command ${websocketCommand} timed out...`)
                }
            }
        }

        await interaction.editReply(this.locale.messages.answers.custom_command_executed
            .replace(/\${username}/g, interaction.user.tag)
            .replace(/\${custom_command}/g, commandId))
    }
}