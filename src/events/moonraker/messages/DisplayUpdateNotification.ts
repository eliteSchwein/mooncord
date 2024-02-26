'use strict'

import {EmbedHelper} from "../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {logRegular} from "../../../helper/LoggerHelper";
import {NotificationHelper} from "../../../helper/NotificationHelper";
import Parse from "regex-parser";

export class DisplayUpdateNotification {

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }
        if (typeof (message.params) === 'undefined') {
            return false
        }

        const embedHelper = new EmbedHelper()
        const configHelper = new ConfigHelper()
        const notificationHelper = new NotificationHelper()
        const m117Config = configHelper.getM117NotifactionConfig()

        if (!m117Config.enable) {
            return false
        }

        const param = message.params[0]

        if (message.method !== 'notify_status_update') {
            return false
        }
        if (typeof param.display_status === 'undefined') {
            return false
        }
        if (typeof param.display_status.message === 'undefined') {
            return false
        }

        const displayMessage = param.display_status.message

        if (displayMessage === null) {
            return false
        }

        const blacklist = m117Config.blacklist
        const whitelist = m117Config.whitelist

        let whitelistValid = (whitelist.length <= 0)

        for (const blacklistItem of blacklist) {
            const blacklistRegex = Parse(blacklistItem)
            if (blacklistRegex.test(displayMessage)) {
                return false
            }
        }

        for (const whitelistItem of whitelist) {
            const whitelistRegex = Parse(whitelistItem)
            if (whitelistRegex.test(displayMessage)) {
                whitelistValid = true
            }
        }

        if (!whitelistValid) {
            return false
        }

        if (notificationHelper.isEmbedBlocked('notification')) {
            return false
        }

        logRegular(`Broadcast Message: ${displayMessage}`)

        const embed = await embedHelper.generateEmbed('notification', {'message': displayMessage})

        await notificationHelper.broadcastMessage(embed.embed)

        return true
    }
}