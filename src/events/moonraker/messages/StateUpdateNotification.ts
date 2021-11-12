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
            console.log('disconnected')
            this.statusHelper.update('disconnected')
            updateData('function', {
                'poll_printer_info': true
            })
        }

        if(message.method === 'notify_klippy_shutdown') {
            console.log('shutdown')
            this.statusHelper.update('shutdown')
            updateData('function', {
                'poll_printer_info': true
            })
        }

        if(message.method === 'notify_klippy_ready') {
            console.log('ready')
            this.statusHelper.update('ready')
            updateData('function', {
                'poll_printer_info': false
            })
            this.moonrakerClient.sendInitCommands()
        }
    }
}