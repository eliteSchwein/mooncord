'use strict'

import {EmbedHelper} from "../../../helper/EmbedHelper";
import {NotificationHelper} from "../../../helper/NotificationHelper";
import {updateData} from "../../../utils/CacheUtil";
import {VersionHelper} from "../../../helper/VersionHelper";
import {logRegular} from "../../../helper/LoggerHelper";

export class UpdateNotification {
    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }
        if (typeof (message.params) === 'undefined') {
            return false
        }

        if (message.method !== 'notify_update_refreshed') {
            return false
        }

        updateData('updates', message.params[0])

        const embedHelper = new EmbedHelper()
        const notificationHelper = new NotificationHelper()
        const versionHelper = new VersionHelper()

        if (!versionHelper.updateAvailable()) {
            return false
        }

        logRegular('There are some Updates available...')

        if (notificationHelper.isEmbedBlocked('system_update')) {
            return false
        }

        const embed = await embedHelper.generateEmbed('system_update')
        void notificationHelper.broadcastMessage(embed.embed)

        return true
    }
}