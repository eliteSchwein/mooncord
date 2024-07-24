'use strict'

import {FileListHelper} from "../../../helper/FileListHelper";
import {getMoonrakerClient} from "../../../Application";
import {getEntry} from "../../../utils/CacheUtil";
import {StatusHelper} from "../../../helper/StatusHelper";
import {InviteMessage} from "../gcode-messages/InviteMessage";
import {BroadcastMessage} from "../gcode-messages/BroadcastMessage";
import {PromptMessage} from "../gcode-messages/PromptMessage";

export class GcodeResponseNotification {

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }
        if (typeof (message.params) === 'undefined') {
            return false
        }

        const param = message.params[0]

        if (message.method !== 'notify_gcode_response') {
            return false
        }

        const statusHelper = new StatusHelper()

        if (param === '// action:cancel') {
            statusHelper.update('stop')
        }

        await new PromptMessage().execute(param)
        await new InviteMessage().execute(param)
        await new BroadcastMessage().execute(param)

        return true
    }
}