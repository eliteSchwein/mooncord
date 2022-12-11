import {ButtonInteraction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {logRegular, logWarn} from "../../../../helper/LoggerHelper";

export class WebsocketButton {
    protected moonrakerClient = getMoonrakerClient()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(!buttonData.function_mapping.websocket_commands) { return }

        if(!interaction.deferred && !interaction.replied) {
            await interaction.deferReply()
        }

        for(const websocketCommand of buttonData.function_mapping.websocket_commands) {
            logRegular(`Execute Websocket Command ${websocketCommand}...`)
            try {
                await this.moonrakerClient.send(websocketCommand)
            } catch {
                logWarn(`The Websocket Command ${websocketCommand} timed out...`)
            }
        }
    }
}