'use strict'

import {getEntry, setData} from "../../../utils/CacheUtil";
import {PromptMessage} from "./PromptMessage";
import {InviteMessage} from "./InviteMessage";
import {BroadcastMessage} from "./BroadcastMessage";
import {StatusHelper} from "../../../helper/StatusHelper";

export class ConsoleMessage {

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }
        if (typeof (message.params) === 'undefined') {
            return false
        }
        if (message.method !== 'notify_gcode_response') {
            return false
        }

        const param = message.params[0]

        const cache = getEntry('execute')

        const gcodeResponse = message.params[0]
        const commandToExecute = cache.to_execute_command

        const statusHelper = new StatusHelper()

        if (param === '// action:cancel') {
            statusHelper.update('stop')
        }

        await new PromptMessage().execute(param)
        await new InviteMessage().execute(param)
        await new BroadcastMessage().execute(param)

        if (!gcodeResponse.includes(commandToExecute)) {
            return false
        }

        if (gcodeResponse.startsWith('//')) {
            cache.unknown_commands.push(commandToExecute)
        }

        if (gcodeResponse.startsWith('!!')) {
            cache.error_commands.push(commandToExecute)
        }

        setData('execute', cache)

        return true
    }
}