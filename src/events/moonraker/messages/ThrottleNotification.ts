'use strict'

import {ConfigHelper} from "../../../helper/ConfigHelper";
import {logWarn} from "../../../helper/LoggerHelper";
import {getEntry, setData} from "../../../utils/CacheUtil";
import {getDiscordClient} from "../../../Application";
import {NotificationHelper} from "../../../helper/NotificationHelper";
import {EmbedHelper} from "../../../helper/EmbedHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";

export class ThrottleNotification {
    protected validFlags = [
        'Under-Voltage Detected',
        'Temperature Limit Active',
        'Frequency Capped'
    ]
    protected cooldownValue = 120

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }
        if (typeof (message.params) === 'undefined') {
            return false
        }

        if (message.method !== 'notify_cpu_throttled') {
            return false
        }

        if (!new ConfigHelper().notifyOnMoonrakerThrottle()) {
            return false
        }

        const {flags} = message.params[0]
        const currentThrottleState = getEntry('throttle')

        for (const flag of flags) {
            if (currentThrottleState.throttle_states.includes(flag)
                && currentThrottleState.cooldown !== 0) {
                currentThrottleState.cooldown = this.cooldownValue
                setData('throttle', currentThrottleState)
                continue
            }
            await this.broadcastThrottle(flag, currentThrottleState)
        }

        return true
    }

    private async broadcastThrottle(flag: string, currentThrottleState) {
        if (!this.validFlags.includes(flag)) {
            return
        }

        logWarn(`A Throttle occured: ${flag}`)

        currentThrottleState.cooldown = this.cooldownValue
        currentThrottleState.throttle_states.push(flag)

        const localeKey = flag
            .toLowerCase()
            .replace(/( |-)/g, '_')

        setData('throttle', currentThrottleState)

        const notificationHelper = new NotificationHelper()
        const embedHelper = new EmbedHelper()

        if (notificationHelper.isEmbedBlocked(`throttle_${localeKey}`)) {
            return
        }

        const embed = await embedHelper.generateEmbed(`throttle_${localeKey}`)

        void notificationHelper.broadcastMessage(embed.embed)
    }
}