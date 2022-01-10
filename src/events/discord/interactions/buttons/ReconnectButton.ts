import {ButtonInteraction} from "discord.js";
import * as App from '../../../../Application'

export class ReconnectButton {

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(!buttonData.function_mapping.reconnect) { return }

        await App.reconnectMoonraker()
    }
}