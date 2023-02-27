import {EmbedHelper} from "../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {logRegular} from "../../../helper/LoggerHelper";
import {NotificationHelper} from "../../../helper/NotificationHelper";
import Parse from "regex-parser";

export class DisplayUpdateNotification {
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected notificationHelper = new NotificationHelper()
    protected m117Config = this.configHelper.getM117NotifactionConfig()

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return
        }
        if (typeof (message.params) === 'undefined') {
            return
        }
        if (!this.m117Config.enable) {
            return
        }

        const param = message.params[0]

        if (message.method !== 'notify_status_update') {
            return
        }
        if (typeof param.display_status === 'undefined') {
            return
        }
        if (typeof param.display_status.message === 'undefined') {
            return
        }

        const displayMessage = param.display_status.message

        if (displayMessage === null) {
            return
        }

        const blacklist = this.m117Config.blacklist
        const whitelist = this.m117Config.whitelist

        let whitelistValid = (whitelist.length <= 0)

        for (const blacklistItem of blacklist) {
            const blacklistRegex = Parse(blacklistItem)
            if (blacklistRegex.test(displayMessage)) {
                return
            }
        }

        for (const whitelistItem of whitelist) {
            const whitelistRegex = Parse(whitelistItem)
            if (whitelistRegex.test(displayMessage)) {
                whitelistValid = true
            }
        }

        if (!whitelistValid) {
            return
        }

        if (this.notificationHelper.isEmbedBlocked('notification')) {
            return
        }

        logRegular(`Broadcast Message: ${displayMessage}`)

        const embed = await this.embedHelper.generateEmbed('notification', {'message': displayMessage})

        this.notificationHelper.broadcastMessage(embed.embed)
    }
}