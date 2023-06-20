'use strict'

import {getMoonrakerClient} from "../../../Application";
import {getEntry} from "../../../utils/CacheUtil";
import {logRegular} from "../../../helper/LoggerHelper";

export class InviteMessage {
    protected moonrakerClient = getMoonrakerClient()

    public async execute(message: string) {
        if (!message.startsWith('mooncord.invite')) {
            return
        }

        const inviteUrl = getEntry('invite_url')

        logRegular('Send Invite URL to Klipper Console...')

        await this.moonrakerClient.send({
            "method": "printer.gcode.script",
            "params": {"script": `RESPOND PREFIX=mooncord.response MSG=${inviteUrl}`}
        })
    }
}