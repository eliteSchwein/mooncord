import {ButtonInteraction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {logWarn} from "../../../../helper/LoggerHelper";

export class WebsocketButton {
    protected moonrakerClient = getMoonrakerClient()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(!buttonData.function_mapping.websocket_command) { return }

        for(const websocketCommand of buttonData.function_mapping.websocket_command) {
            try {
                await this.moonrakerClient.send(websocketCommand)
            } catch {
                logWarn(`The Websocket Command ${websocketCommand} timed out...`)
            }
        }
    }
}