'use strict'

import {Message, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {logNotice, logRegular, logWarn} from "../../../../helper/LoggerHelper";
import BaseHandler from "../abstracts/BaseHandler";

export class WebsocketHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        if (!data.websocket_requests) {
            return false
        }
        return true
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        if (interaction !== null && !interaction.deferred && !interaction.replied) {
            await interaction.deferReply()
        }

        let websocketTimeout = 10_000

        if(data.websocket_timeout && data.websocket_timeout === -1) {
            websocketTimeout = Number.POSITIVE_INFINITY
        } else if(data.websocket_timeout) {
            websocketTimeout = data.websocket_timeout
        }

        const moonrakerClient = getMoonrakerClient()

        for (const websocketCommand of data.websocket_requests) {
            logRegular(`Execute Websocket Command ${JSON.stringify(websocketCommand)}...`)
            try {
                await moonrakerClient.send(websocketCommand, websocketTimeout)
            } catch {
                logWarn(`The Websocket Command ${JSON.stringify(websocketCommand)} timed out...`)
            }
        }
    }
}