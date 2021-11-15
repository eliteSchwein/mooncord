import {getEntry, setData, updateData} from "../../../utils/CacheUtil";
import {StatusHelper} from "../../../helper/StatusHelper";

export class SubscriptionNotification {
    protected statusHelper = new StatusHelper()
    protected functionCache = getEntry('function')
    public parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }

        const param = message.params[0]

        if(message.method !== 'notify_status_update') { return }

        updateData('state', param)

        if(typeof param.print_stats !== 'undefined') {
            this.parsePrintStats(param.print_stats)
        }
    }

    protected parsePrintStats(printStatsData) {
        if(typeof printStatsData.state === 'undefined') { return }

        let status = printStatsData.state

        if(status === 'standby') { status = 'ready'}

        if(status === 'printing') {
            void this.statusHelper.update('start')
        }

        if(status === 'ready' && this.functionCache.current_status === 'printing') {
            void this.statusHelper.update('stop')
        }

        void this.statusHelper.update(status)
    }
}