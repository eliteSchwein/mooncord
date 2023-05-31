import {Message, User} from "discord.js";
import * as App from '../../../../Application'

export class ReconnectHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("reconnect")) {
            return
        }

        await App.reconnectMoonraker()
    }
}