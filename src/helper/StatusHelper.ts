import {findValue, getEntry, updateData} from "../utils/CacheUtil"
import {EmbedHelper} from "./EmbedHelper";
import * as app from "../Application";
import {LocaleHelper} from "./LocaleHelper";
import {logRegular} from "./LoggerHelper";
import {DiscordClient} from "../clients/DiscordClient";
import {ConfigHelper} from "./ConfigHelper";
import { NotificationHelper } from "./NotificationHelper";
import {waitUntil} from "async-wait-until";

export class StatusHelper {
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected statusMeta = this.configHelper.getStatusMeta()
    protected discordClient: DiscordClient
    protected notificationHelper = new NotificationHelper()

    public async update(status: string = null, discordClient: DiscordClient = null) {
        if(typeof discordClient === null) {
            discordClient = app.getDiscordClient()
        }
        this.discordClient = discordClient
        let functionCache = getEntry('function')
        const serverInfo  = getEntry('server_info')
        const klipperStatus = findValue('state.print_stats.state')

        if(typeof serverInfo === 'undefined') { return }

        if(typeof status === 'undefined' || status === null) {
            //if(serverInfo.klippy_connected && serverInfo.klippy_state !== 'shutdown') {
                //status = klipperStatus
           // } else {
                status = serverInfo.klippy_state
           // }
        }

        if(status === 'standby') {
            status = 'ready'
        }

        if(typeof status === 'undefined') {
            return
        }

        const currentStatus = functionCache.current_status
        const currentStatusMeta = this.statusMeta[currentStatus]
        const statusMeta = this.statusMeta[status]
        if(!currentStatusMeta.meta_data.allow_same && status === currentStatus) { return }
        if(currentStatusMeta.meta_data.prevent.includes(status)) { return }
        if(status === 'printing' && !this.checkPercentSame()) { return }

        logRegular(`klipper status changed to ${status}...`)

        updateData('function', {
            'current_status': status,
            'current_percent': findValue('state.display_status.progress').toFixed(2)
        })

        functionCache = getEntry('function')
        
        await waitUntil(() => !functionCache.status_in_query, { timeout: 20_000, intervalBetweenAttempts: 500 })

        updateData('function', {
            'status_in_query': true
        })

        const statusEmbed = await this.embedHelper.generateEmbed(statusMeta.embed_id)

        if(this.discordClient === null) {
            this.discordClient = app.getDiscordClient()
        }

        if(typeof statusMeta.activity !== 'undefined') {
            this.discordClient.getClient().user.setPresence({
                status: statusMeta.activity.status
            })

            this.discordClient.getClient().user.setActivity(
                statusEmbed.activity,
                {type: statusMeta.activity.type}
            )
        }
        
        if(status === 'printing' && !this.checkPercentMatch()) { return }

        this.notificationHelper.broadcastMessage(statusEmbed.embed)

        updateData('function', {
            'status_in_query': false
        })
    }

    protected checkPercentSame() {
        const progress = findValue('state.display_status.progress').toFixed(2)
        const currentProgress = findValue('function.current_percent')

        if(progress === 0 || progress === 1) {
            return false
        }

        if(progress === currentProgress) {
            return false
        }

        return true
    }

    protected checkPercentMatch() {
        const progress = findValue('state.display_status.progress').toFixed(2) * 100

        if(!this.configHelper.isStatusPerPercent()) {
            return true
        }
        if(this.configHelper.getStatusInterval() % progress === 0) {
            return true
        }

        return false
    }
}