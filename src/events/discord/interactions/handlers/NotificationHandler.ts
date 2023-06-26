'use strict'

import {Message, User} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {removeFromArray} from "../../../../helper/DataHelper";

export class NotificationHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("notify_enable") && !data.functions.includes("notify_disable")) {
            return
        }

        const databaseUtil = getDatabase()
        const notifyList = databaseUtil.getDatabaseEntry('notify')

        if (!notifyList.includes(user.id) && data.functions.includes("notify_enable")) {
            notifyList.push(user.id)
        }

        if (notifyList.includes(user.id) && data.functions.includes("notify_disable")) {
            removeFromArray(notifyList, user.id)
        }

        await databaseUtil.updateDatabaseEntry('notify', notifyList)
    }
}