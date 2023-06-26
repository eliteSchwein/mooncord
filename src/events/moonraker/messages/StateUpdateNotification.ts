'use strict'

import {updateData} from "../../../utils/CacheUtil";
import {getMoonrakerClient, reconnectDiscord, reloadCache, restartScheduler} from "../../../Application";
import {StatusHelper} from "../../../helper/StatusHelper";
import {logEmpty, logSuccess} from "../../../helper/LoggerHelper";

export class StateUpdateNotification {

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return
        }

        const moonrakerClient = getMoonrakerClient()
        const statusHelper = new StatusHelper()

        if (message.method === 'notify_klippy_disconnected') {
            await statusHelper.update('disconnected')
            updateData('function', {
                'poll_printer_info': true
            })
        }

        if (message.method === 'notify_klippy_shutdown') {
            await statusHelper.update('shutdown')
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
            await moonrakerClient.sendInitCommands()
            await reconnectDiscord()
            await restartScheduler()
            await statusHelper.update()
        }
    }
}