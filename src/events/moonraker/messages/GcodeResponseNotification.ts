'use strict'

import {FileListHelper} from "../../../helper/FileListHelper";
import {getMoonrakerClient} from "../../../Application";
import {getEntry} from "../../../utils/CacheUtil";
import {StatusHelper} from "../../../helper/StatusHelper";
import {InviteMessage} from "../gcode-messages/InviteMessage";
import {BroadcastMessage} from "../gcode-messages/BroadcastMessage";

export class GcodeResponseNotification {

    public parse(message) {
        if (typeof (message.method) === 'undefined') {
            return
        }
        if (typeof (message.params) === 'undefined') {
            return
        }

        const param = message.params[0]

        if (message.method !== 'notify_gcode_response') {
            return
        }

        const statusHelper = new StatusHelper()

        if (param === '// action:cancel') {
            statusHelper.update('stop')
        }

        void new InviteMessage().execute(param)
        void new BroadcastMessage().execute(param)
    }
}