import {ButtonInteraction, Message, User} from "discord.js";
import * as App from '../../../../Application'

export class ReconnectHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if(!data.function_mapping.reconnect) { return }

        await App.reconnectMoonraker()
    }
}