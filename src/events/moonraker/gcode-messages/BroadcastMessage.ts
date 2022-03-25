import {EmbedHelper} from "../../../helper/EmbedHelper";
import {logRegular} from "../../../helper/LoggerHelper";
import {NotificationHelper} from "../../../helper/NotificationHelper";
import {findValue} from "../../../utils/CacheUtil";

export class BroadcastMessage {
    protected embedHelper = new EmbedHelper()
    protected notificationHelper = new NotificationHelper()

    public async execute(message: string) {
        if(!message.startsWith('mooncord.broadcast')) { return }

        const defaultColor = findValue('embeds.notification.color')

        const notificationMessageRaw = message.slice(19)
        const notificationMessageFragments = notificationMessageRaw.split('COLOR:')
        const notificationMessage = notificationMessageFragments[0]
        const color = ((notificationMessageFragments.length > 1) ? `#${notificationMessageFragments[1]}` : defaultColor)

        logRegular(`Broadcast Message: ${notificationMessage}`)

        const embed = await this.embedHelper.generateEmbed('notification', {'message': notificationMessage}, null, {color})

        this.notificationHelper.broadcastMessage(embed.embed)
    }
}