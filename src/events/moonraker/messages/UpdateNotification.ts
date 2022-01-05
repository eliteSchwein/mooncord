import { EmbedHelper } from "../../../helper/EmbedHelper";
import { NotificationHelper } from "../../../helper/NotificationHelper";
import {updateData} from "../../../utils/CacheUtil";

export class UpdateNotification {
    protected embedHelper = new EmbedHelper()
    protected notificationHelper = new NotificationHelper()

    public async parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }

        if(message.method !== 'notify_update_response') { return }

        updateData('updates', message.params[0])

        const embed = await this.embedHelper.generateEmbed('system_update')
        void this.notificationHelper.broadcastMessage(embed.embed)
    }
}