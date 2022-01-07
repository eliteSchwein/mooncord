import { EmbedHelper } from "../../../helper/EmbedHelper";
import { NotificationHelper } from "../../../helper/NotificationHelper";
import {updateData} from "../../../utils/CacheUtil";
import {VersionHelper} from "../../../helper/VersionHelper";
import {logRegular} from "../../../helper/LoggerHelper";

export class UpdateNotification {
    protected embedHelper = new EmbedHelper()
    protected notificationHelper = new NotificationHelper()
    protected versionHelper = new VersionHelper()

    public async parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }

        if(message.method !== 'notify_update_refreshed') { return }

        updateData('updates', message.params[0])

        if(!this.versionHelper.updateAvailable()) { return }

        logRegular('There are some Updates available...')

        const embed = await this.embedHelper.generateEmbed('system_update')
        void this.notificationHelper.broadcastMessage(embed.embed)
    }
}