import {findValue, getEntry, updateData} from "../utils/CacheUtil"
import {EmbedHelper} from "./EmbedHelper";
import * as app from "../Application";
import {LocaleHelper} from "./LocaleHelper";
import {logNotice, logRegular} from "./LoggerHelper";
import {DiscordClient} from "../clients/DiscordClient";
import {ConfigHelper} from "./ConfigHelper";
import {NotificationHelper} from "./NotificationHelper";
import {waitUntil} from "async-wait-until";

export class StatusHelper {
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected statusMeta = this.configHelper.getStatusMeta()
    protected bypassChecks = false
    protected discordClient: DiscordClient
    protected notificationHelper = new NotificationHelper()

    public async update(status: string = null, bypassChecks: boolean = false, discordClient: DiscordClient = null) {
        if(typeof discordClient === null) {
            discordClient = app.getDiscordClient()
        }

        this.bypassChecks = bypassChecks
        this.discordClient = discordClient
        let functionCache = getEntry('function')
        const serverInfo  = getEntry('server_info')
        const stateCache = getEntry('state')
        const klipperStatus = stateCache.print_stats.state
        const progress = stateCache.display_status.progress.toFixed(2)

        if(functionCache.status_cooldown !== 0) {
            logNotice('Status cooldown is currently active!')
            return
        }

        if(typeof serverInfo === 'undefined') { return }

        if(typeof status === 'undefined' || status === null) {
            if(serverInfo.klippy_state !== 'ready') {
                status = serverInfo.klippy_state
            } else {
                status = klipperStatus
            }
        }

        if(status === 'standby') {
            status = 'ready'
        }

        if(status === 'initializing') {
            status = 'startup'
        }

        if(status === 'paused') {
            status = 'pause'
        }

        if(status === 'cancelled') {
            status = 'stop'
        }

        if(status === 'pause' && functionCache.ignore_pause) { return }

        if(typeof status === 'undefined') { return }

        const currentStatus = functionCache.current_status

        if(status === 'start' && currentStatus === 'pause') {
            this.bypassChecks = true
            status = 'printing'
        }

        if(status === 'ready' && currentStatus === 'printing') {
            await this.update('stop')
        }

        if(status === 'printing' && currentStatus === 'startup') {
            await this.update('start')
        }

        if(status === 'complete' && currentStatus === 'startup') {
            status = 'ready'
        }

        const currentStatusMeta = this.statusMeta[currentStatus]
        const statusMeta = this.statusMeta[status]
        if(!currentStatusMeta.meta_data.allow_same && status === currentStatus) { return }
        if(currentStatusMeta.meta_data.prevent.includes(status)) { return }
        if(status === 'printing' && !this.checkPercentSame()) { return }
        if(statusMeta.cooldown !== undefined) {
            updateData('function', {
                'status_cooldown': statusMeta.cooldown
            })
        }

        updateData('function', {
            'current_status': status
        })

        if(status === 'start') {
            updateData('function', {
                'current_percent': 0
            })
        }

        if(status === 'printing') {
            updateData('function', {
                'current_percent': progress
            })
            logRegular(`print is to ${(progress*100).toFixed(0)}% complete...`)
        } else {
            logRegular(`klipper status changed to ${status}...`)
        }

        functionCache = getEntry('function')
        
        await waitUntil(() => !functionCache.status_in_query, { timeout: 40_000, intervalBetweenAttempts: 500 })

        updateData('function', {
            'status_in_query': true
        })

        const statusEmbed = await this.embedHelper.generateEmbed(statusMeta.embed_id)

        if(this.discordClient === null) {
            this.discordClient = app.getDiscordClient()
        }

        if(status === 'printing' && this.checkPercentMatch() && !this.notificationHelper.isEmbedBlocked(statusMeta.embed_id) ||
        status !== 'printing' && !this.notificationHelper.isEmbedBlocked(statusMeta.embed_id)) {
            this.notificationHelper.broadcastMessage(statusEmbed.embed)
        }

        this.bypassChecks = false

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

        if(this.bypassChecks) {
            return true
        }

        if(progress === currentProgress) {
            return false
        }

        if(progress === 0 || progress === 100) {
            return true
        }

        if(progress < currentProgress) {
            return false
        }

        return true
    }

    protected checkPercentMatch() {
        let progress = findValue('state.display_status.progress').toFixed(2)
        progress = (progress*100).toFixed(2)

        if(this.bypassChecks) {
            return true
        }

        if(!this.configHelper.isStatusPerPercent()) {
            return true
        }

        if(progress % this.configHelper.getStatusInterval().toFixed(2) === 0) {
            return true
        }

        return false
    }
}