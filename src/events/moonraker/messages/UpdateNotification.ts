import {setData, updateData} from "../../../utils/CacheUtil";

export class UpdateNotification {
    public parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }

        if(message.method !== 'notify_update_manager') { return }

        updateData('updates', message.params[0])
    }
}