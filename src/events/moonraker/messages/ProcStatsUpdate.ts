import {setData} from "../../../utils/CacheUtil";

export class ProcStatsUpdate {
    public parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }

        if(message.method !== 'notify_proc_stat_update') { return }

        setData('proc_stats', message.params[0])
        return true
    }
}