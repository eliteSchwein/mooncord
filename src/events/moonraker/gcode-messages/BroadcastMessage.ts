import {EmbedHelper} from "../../../helper/EmbedHelper";
import {logRegular} from "../../../helper/LoggerHelper";
import {NotificationHelper} from "../../../helper/NotificationHelper";

export class BroadcastMessage {
    protected embedHelper = new EmbedHelper()
    protected notificationHelper = new NotificationHelper()

    public async execute(message: string) {
        if(!message.startsWith('mooncord.broadcast')) { return }

        const notificationMessage = message.slice(19)

        logRegular(`Broadcast Message: ${notificationMessage}`)

        const embed = await this.embedHelper.generateEmbed('notification', {'message': notificationMessage})

        this.notificationHelper.broadcastMessage(embed.embed)
    }
}