'use strict'

import {Message, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {logRegular, logWarn} from "../../../../helper/LoggerHelper";
import BaseHandler from "../abstracts/BaseHandler";
import {getEntry, setData} from "../../../../utils/CacheUtil";

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

        if (data.websocket_timeout && data.websocket_timeout === -1) {
            websocketTimeout = Number.POSITIVE_INFINITY
        } else if (data.websocket_timeout) {
            websocketTimeout = data.websocket_timeout
        }

        if (data.websocket_prevent_methods) {
            const websocketCache = getEntry('websocket')
            for (const preventMethod of data.websocket_prevent_methods) {
                websocketCache.blocked.push(preventMethod)
            }
            setData('websocket', websocketCache)
        }

        const moonrakerClient = getMoonrakerClient()

        for (let websocketCommand of data.websocket_requests) {
            websocketCommand = await this.templateHelper.parsePlaceholder(JSON.stringify(websocketCommand))

            logRegular(`Execute Websocket Command ${websocketCommand}...`)
            try {
                await moonrakerClient.send(JSON.parse(websocketCommand), websocketTimeout)
            } catch {
                logWarn(`The Websocket Command ${websocketCommand} timed out...`)
            }
        }
    }
}