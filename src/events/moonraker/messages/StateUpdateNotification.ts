import {updateData} from "../../../utils/CacheUtil";
import {getMoonrakerClient, reconnectDiscord, reloadCache, restartScheduler} from "../../../Application";
import {StatusHelper} from "../../../helper/StatusHelper";
import {logEmpty, logSuccess} from "../../../helper/LoggerHelper";

export class StateUpdateNotification {
    protected moonrakerClient = getMoonrakerClient()
    protected statusHelper = new StatusHelper()

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return
        }

        if (message.method === 'notify_klippy_disconnected') {
            await this.statusHelper.update('disconnected')
            updateData('function', {
                'poll_printer_info': true
            })
        }

        if (message.method === 'notify_klippy_shutdown') {
            await this.statusHelper.update('shutdown')
            updateData('function', {
                'poll_printer_info': true
            })
        }

        if (message.method === 'notify_klippy_ready') {
            updateData('function', {
                'poll_printer_info': false
            })
            logEmpty()
            logSuccess('klipper is ready...')

            reloadCache()
            await this.moonrakerClient.sendInitCommands()
            await reconnectDiscord()
            await restartScheduler()
            await this.statusHelper.update()
        }
    }
}