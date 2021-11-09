import {setData, updateData} from "../../../utils/CacheUtil";
import {getMoonrakerClient} from "../../../Application";
import {logRegular} from "../../../helper/LoggerHelper";
import {StatusHelper} from "../../../helper/StatusHelper";

export class StateUpdateNotification {
    protected moonrakerClient = getMoonrakerClient()
    protected statusHelper = new StatusHelper()

    public parse(message) {
        if(typeof(message.method) === 'undefined') { return }

        if(message.method === 'notify_klippy_disconnected') {
            this.statusHelper.update('disconnected')
            updateData('function', {
                'poll_server_info': true
            })
        }

        if(message.method === 'notify_klippy_shutdown') {
            this.statusHelper.update('shutdown')
            updateData('function', {
                'poll_server_info': true
            })
        }

        if(message.method === 'notify_klippy_ready') {
            this.statusHelper.update('ready')
            updateData('function', {
                'poll_server_info': false
            })
            this.moonrakerClient.sendInitCommands()
        }
    }
}