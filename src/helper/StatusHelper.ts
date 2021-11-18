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
        const klippyConnected = serverInfo.klippy_connected

        if(typeof serverInfo === 'undefined') { return }

        if(typeof status === 'undefined' || status === null) {
            if(klippyConnected &&
                serverInfo.klippy_state !== 'shutdown' &&
                serverInfo.klippy_state !== 'error') {
                status = klipperStatus
            } else {
                status = serverInfo.klippy_state
            }
        }

        if(status === 'standby') {
            status = 'ready'
        }

        if(typeof status === 'undefined') {
            return
        }

        const currentStatus = functionCache.current_status

        if(status === 'printing' && currentStatus === 'startup') {
            await this.update('start')
        }

        const currentStatusMeta = this.statusMeta[currentStatus]
        const statusMeta = this.statusMeta[status]
        if(!currentStatusMeta.meta_data.allow_same && status === currentStatus) { return }
        if(currentStatusMeta.meta_data.prevent.includes(status)) { return }
        if(status === 'printing' && !this.checkPercentSame()) { return }

        const progress = findValue('state.display_status.progress').toFixed(2)

        updateData('function', {
            'current_status': status
        })

        if(status === 'start') {
            updateData('function', {
                'current_percent': -1
            })
        }

        if(status === 'printing') {
            updateData('function', {
                'current_percent': progress
            })
            logRegular(`print is to ${(progress*100).toFixed(0)}% done...`)
        } else {
            logRegular(`klipper status changed to ${status}...`)
        }

        functionCache = getEntry('function')
        
        await waitUntil(() => !functionCache.status_in_query, { timeout: 20_000, intervalBetweenAttempts: 500 })

        updateData('function', {
            'status_in_query': true
        })

        const statusEmbed = await this.embedHelper.generateEmbed(statusMeta.embed_id)

        if(this.discordClient === null) {
            this.discordClient = app.getDiscordClient()
        }

        if(status === 'printing' && this.checkPercentMatch() ||
        status !== 'printing') {
            this.notificationHelper.broadcastMessage(statusEmbed.embed)
        }

        updateData('function', {
            'status_in_query': false
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

    protected checkPercentSame() {
        const progress = findValue('state.display_status.progress').toFixed(2)
        const currentProgress = findValue('function.current_percent')

        if(progress === currentProgress) {
            return false
        }

        return true
    }

    protected checkPercentMatch() {
        let progress = findValue('state.display_status.progress').toFixed(2)
        progress = (progress*100).toFixed(2)

        if(!this.configHelper.isStatusPerPercent()) {
            return true
        }

        if(progress % this.configHelper.getStatusInterval().toFixed(2) === 0) {
            return true
        }

        return false
    }
}