import {findValue, getEntry, setData, updateData} from "../../../utils/CacheUtil";
import {StatusHelper} from "../../../helper/StatusHelper";
import { MetadataHelper } from "../../../helper/MetadataHelper";
import { updateTimes } from "../../../helper/TimeHelper";
import { updateLayers } from "../../../helper/LayerHelper";

export class SubscriptionNotification {
    protected statusHelper = new StatusHelper()
    protected metadataHelper = new MetadataHelper()
    protected functionCache = getEntry('function')
    public parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }

        const param = message.params[0]

        if(message.method !== 'notify_status_update') { return }

        updateData('state', param)

        if(typeof param.print_stats !== 'undefined') {
            void this.parsePrintStats(param.print_stats)
        }
    }

    protected async parsePrintStats(printStatsData) {
        if(typeof printStatsData.state === 'undefined') { return }

        let status = printStatsData.state

        if(status === 'printing') {
            await this.metadataHelper.retrieveMetaData(findValue('state.print_stats.filename'))
            updateTimes()
            updateLayers()
            await this.statusHelper.update('start')
        }

        await this.statusHelper.update(status)

        if(status === 'complete') {
            await this.statusHelper.update('ready')
        }
    }
}