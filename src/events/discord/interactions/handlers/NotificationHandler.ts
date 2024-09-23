'use strict'

import {Message, User} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {removeFromArray} from "../../../../helper/DataHelper";
import BaseHandler from "./BaseHandler";

export class NotificationHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        return !(!data.functions.includes("notify_enable")
            && !data.functions.includes("notify_disable"))
    }
    async handleHandler(message: Message, user: User, data, interaction = null) {
        const notifyList = this.database.getDatabaseEntry('notify')

        if (!notifyList.includes(user.id) && data.functions.includes("notify_enable")) {
            notifyList.push(user.id)
        }

        if (notifyList.includes(user.id) && data.functions.includes("notify_disable")) {
            removeFromArray(notifyList, user.id)
        }

        await this.database.updateDatabaseEntry('notify', notifyList)
    }
}