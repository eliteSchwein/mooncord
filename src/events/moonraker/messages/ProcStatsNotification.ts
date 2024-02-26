'use strict'

import {setData} from "../../../utils/CacheUtil";

export class ProcStatsNotification {
    public parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }
        if (typeof (message.params) === 'undefined') {
            return false
        }

        if (message.method !== 'notify_proc_stat_update') {
            return false
        }

        setData('proc_stats', message.params[0])

        return true
    }
}