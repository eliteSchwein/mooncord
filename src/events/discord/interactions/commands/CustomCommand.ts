import {CommandInteraction} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DiscordCommandGenerator} from "../../../../generator/DiscordCommandGenerator";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import {logRegular, logWarn} from "../../../../helper/LoggerHelper";

export class CustomCommand {
    protected commandGenerator = new DiscordCommandGenerator()
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected consoleHelper = new ConsoleHelper()
    protected moonrakerClient = getMoonrakerClient()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(!this.commandGenerator.isCustomCommand(commandId)) { return }

        this.execute(interaction, commandId)
    }

    protected async execute(interaction: CommandInteraction, commandId: string) {
        const customCommandData = this.commandGenerator.getCustomCommandData(commandId)

        await interaction.deferReply()

        if(customCommandData.macros !== undefined) {
            await this.consoleHelper.executeGcodeCommands(customCommandData.macros,
                interaction.channel)
        }

        if(customCommandData.websocket_commands !== undefined) {
            for(const websocketCommand of customCommandData.websocket_commands) {
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