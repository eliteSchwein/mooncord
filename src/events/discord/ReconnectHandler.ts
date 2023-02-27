import {Client} from "discord.js";
import * as App from "../../Application"
import {logWarn} from "../../helper/LoggerHelper";

export class ReconnectHandler {
    protected isReconnect = false

    public constructor(discordClient: Client) {
        discordClient.on('debug', info => {
            if (info.includes('Failed to connect to the gateway') && !this.isReconnect) {
                logWarn('Discord Client is offline...')
                this.isReconnect = true
            }

            if (info.includes('CONNECTED') && this.isReconnect) {
                this.isReconnect = false
                void App.reconnectDiscord()
            }
        })
    }
}