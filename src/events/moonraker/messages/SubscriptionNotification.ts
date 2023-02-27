import {findValue, getEntry, updateData} from "../../../utils/CacheUtil";
import {StatusHelper} from "../../../helper/StatusHelper";
import {MetadataHelper} from "../../../helper/MetadataHelper";
import {UsageHelper} from "../../../helper/UsageHelper";
import {HistoryHelper} from "../../../helper/HistoryHelper";
import {TempHelper} from "../../../helper/TempHelper";

export class SubscriptionNotification {
    protected statusHelper = new StatusHelper()
    protected metadataHelper = new MetadataHelper()
    protected functionCache = getEntry('function')
    protected usageHelper = new UsageHelper()
    protected historyHelper = new HistoryHelper()

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

    protected async parsePrintStats(printStatsData) {
        if (typeof printStatsData.state === 'undefined') {
            return
        }

        let status = printStatsData.state

        if (status === 'printing') {
            await this.metadataHelper.updateMetaData(findValue('state.print_stats.filename'))
            await this.statusHelper.update('start')
        }

        await this.statusHelper.update(status)

        if (status === 'complete') {
            await this.historyHelper.parseData()
        }
    }
}