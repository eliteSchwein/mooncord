'use strict'

import {Message, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {logRegular, logWarn} from "../../../../helper/LoggerHelper";
import BaseHandler from "./BaseHandler";

export class WebsocketHandler extends BaseHandler{
    async isValid(message: Message, user: User, data, interaction = null) {
        if (!data.websocket_requests) {
            return false
        }
        return true
    }

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.websocket_requests) {
            return
        }

        if (interaction !== null && !interaction.deferred && !interaction.replied) {
            await interaction.deferReply()
        }

        const moonrakerClient = getMoonrakerClient()

        for (const websocketCommand of data.websocket_requests) {
            logRegular(`Execute Websocket Command ${JSON.stringify(websocketCommand)}...`)
            try {
                await moonrakerClient.send(websocketCommand)
            } catch {
                logWarn(`The Websocket Command ${JSON.stringify(websocketCommand)} timed out...`)
            }
        }
    }
}