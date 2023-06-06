import {Message, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {logRegular, logWarn} from "../../../../helper/LoggerHelper";

export class WebsocketHandler {
    protected moonrakerClient = getMoonrakerClient()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.websocket_requests) {
            return
        }

        if (interaction !== null && !interaction.deferred && !interaction.replied) {
            await interaction.deferReply()
        }

        for (const websocketCommand of data.websocket_requests) {
            logRegular(`Execute Websocket Command ${JSON.stringify(websocketCommand)}...`)
            try {
                await this.moonrakerClient.send(websocketCommand)
            } catch {
                logWarn(`The Websocket Command ${websocketCommand} timed out...`)
            }
        }
    }
}