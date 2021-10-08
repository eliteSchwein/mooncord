import {setData, updateData} from "../../../utils/CacheUtil";

export class SubscriptionNotification {
    public parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }

        if(message.method !== 'notify_status_update') { return }

        updateData('updates', message.params[0])
        return true
    }
}