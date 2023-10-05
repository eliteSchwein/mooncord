'use strict'

import {EmbedHelper} from "../../../helper/EmbedHelper";
import {logRegular} from "../../../helper/LoggerHelper";
import {NotificationHelper} from "../../../helper/NotificationHelper";
import {findValue} from "../../../utils/CacheUtil";

export class BroadcastMessage {

    public async execute(message: string) {
        if (!message.startsWith('mooncord.broadcast')) {
            return
        }

        const embedHelper = new EmbedHelper()
        const notificationHelper = new NotificationHelper()
        const defaultColor = findValue('embeds.notification.color')

        const notificationMessageRaw = message.slice(19)
        const notificationMessageFragments = notificationMessageRaw.split('COLOR:')
        const notificationMessage = notificationMessageFragments[0]
        const color = ((notificationMessageFragments.length > 1) ? `#${notificationMessageFragments[1]}` : defaultColor)

        if (notificationHelper.isEmbedBlocked('notification')) {
            return
        }

        logRegular(`Broadcast Message: ${notificationMessage}`)

        const embed = await embedHelper.generateEmbed('notification', {'message': notificationMessage}, null, {color})

        void notificationHelper.broadcastMessage(embed.embed)
    }
}