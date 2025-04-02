'use strict'

import {findValue, updateData} from "../../../utils/CacheUtil";
import {StatusHelper} from "../../../helper/StatusHelper";
import {MetadataHelper} from "../../../helper/MetadataHelper";
import {HistoryHelper} from "../../../helper/HistoryHelper";
import {TempHelper} from "../../../helper/TempHelper";
import {getMoonrakerClient} from "../../../Application";

export class SubscriptionNotification {
    protected moonrakerClient = getMoonrakerClient()

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }
        if (typeof (message.params) === 'undefined') {
            return false
        }

        const param = message.params[0]

        if (message.method !== 'notify_status_update') {
            return false
        }

        updateData('state', this.moonrakerClient.clearStateData(param))

        if (typeof param.print_stats !== 'undefined') {
            await this.parsePrintStats(param.print_stats)
        }

        const tempHelper = new TempHelper()
        tempHelper.updateHeaterTargets()

        return true
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