import {getEntry, updateData} from "../utils/CacheUtil"
import {EmbedHelper} from "./EmbedHelper";
import * as app from "../Application";
import {LocaleHelper} from "./LocaleHelper";
import {logRegular} from "./LoggerHelper";
import {DiscordClient} from "../clients/DiscordClient";
import {ConfigHelper} from "./ConfigHelper";

export class StatusHelper {
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected statusMeta = this.configHelper.getStatusMeta()
    protected discordClient: DiscordClient

    public async update(status: string = null, discordClient: DiscordClient = null) {
        if(typeof discordClient === null) {
            discordClient = app.getDiscordClient()
        }
        this.discordClient = discordClient
        const functionCache = getEntry('function')
        const serverInfo  = getEntry('server_info')

        if(typeof serverInfo === 'undefined') { return }

        if(typeof status === 'undefined' || status === null) {
            status = serverInfo.klippy_state
        }

        if(typeof status === 'undefined') {
            return
        }

        const currentStatus = functionCache.current_status
        const currentStatusMeta = this.statusMeta[currentStatus]
        const statusMeta = this.statusMeta[status]

        if(!currentStatusMeta.meta_data.allow_same && status === currentStatus) { return }
        if(currentStatusMeta.meta_data.prevent.includes(status)) { return }

        const statusEmbed = await this.embedHelper.generateEmbed(statusMeta.embed_id)

        logRegular(`klipper status changed to ${status}...`)

        updateData('function', {
            'current_status': status
        })

        if(typeof statusMeta.activity !== 'undefined') {
            this.discordClient.getClient().user.setPresence({
                status: statusMeta.activity.status
            })

            this.discordClient.getClient().user.setActivity(
                statusEmbed.activity,
                {type: statusMeta.activity.type}
            )
        }
    }
}