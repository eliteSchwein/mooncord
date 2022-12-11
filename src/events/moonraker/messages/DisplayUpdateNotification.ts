import {EmbedHelper} from "../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {logRegular} from "../../../helper/LoggerHelper";
import {NotificationHelper} from "../../../helper/NotificationHelper";

export class DisplayUpdateNotification {
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected notificationHelper = new NotificationHelper()

    public async parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }
        if(!this.configHelper.showM117Notifcation()) { return }

        const param = message.params[0]

        if(message.method !== 'notify_status_update') { return }
        if(typeof param.display_status === 'undefined') { return }
        if(typeof param.display_status.message === 'undefined') { return }

        const displayMessage = param.display_status.message

        if(displayMessage === null) { return }
        if(displayMessage.match(/(Rendering (\||\/|-|\\))/g)) { return }

        logRegular(`Broadcast Message: ${displayMessage}`)

        const embed = await this.embedHelper.generateEmbed('notification', {'message': displayMessage})

        this.notificationHelper.broadcastMessage(embed.embed)
    }
}