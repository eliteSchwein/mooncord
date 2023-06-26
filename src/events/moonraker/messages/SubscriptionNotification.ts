'use strict'

import {findValue, getEntry, updateData} from "../../../utils/CacheUtil";
import {StatusHelper} from "../../../helper/StatusHelper";
import {MetadataHelper} from "../../../helper/MetadataHelper";
import {UsageHelper} from "../../../helper/UsageHelper";
import {HistoryHelper} from "../../../helper/HistoryHelper";
import {TempHelper} from "../../../helper/TempHelper";

export class SubscriptionNotification {

    public parse(message) {
        if (typeof (message.method) === 'undefined') {
            return
        }
        if (typeof (message.params) === 'undefined') {
            return
        }

        const param = message.params[0]

        if (message.method !== 'notify_status_update') {
            return
        }

        updateData('state', param)

        if (typeof param.print_stats !== 'undefined') {
            void this.parsePrintStats(param.print_stats)
        }

        const tempHelper = new TempHelper()
        tempHelper.updateHeaterTargets()
    }

    private async parsePrintStats(printStatsData) {
        if (typeof printStatsData.state === 'undefined') {
            return
        }

        const statusHelper = new StatusHelper()
        const metadataHelper = new MetadataHelper()
        const historyHelper = new HistoryHelper()

        let status = printStatsData.state

        if (status === 'printing') {
            await metadataHelper.updateMetaData(findValue('state.print_stats.filename'))
            await statusHelper.update('start')
        }

        await statusHelper.update(status)

        if (status === 'complete') {
            await historyHelper.parseData()
        }
    }
}