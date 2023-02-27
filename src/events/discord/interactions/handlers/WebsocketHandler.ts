import {Message, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {logRegular, logWarn} from "../../../../helper/LoggerHelper";

export class WebsocketHandler {
    protected moonrakerClient = getMoonrakerClient()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.function_mapping.websocket_commands) {
            return
        }

        if (interaction !== null && !interaction.deferred && !interaction.replied) {
            await interaction.deferReply()
        }

        for (const websocketCommand of data.function_mapping.websocket_commands) {
            logRegular(`Execute Websocket Command ${websocketCommand}...`)
            try {
                await this.moonrakerClient.send(websocketCommand)
            } catch {
                logWarn(`The Websocket Command ${websocketCommand} timed out...`)
            }
        }
    }
}