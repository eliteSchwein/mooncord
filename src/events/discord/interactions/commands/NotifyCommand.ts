'use strict'

import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {removeFromArray} from "../../../../helper/DataHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class NotifyCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'notify') {
            return
        }

        void this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const databaseUtil = getDatabase()
        const notifyList = databaseUtil.getDatabaseEntry('notify')
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()

        const user = interaction.user

        let answer

        if (notifyList.includes(user.id)) {
            removeFromArray(notifyList, user.id)
            answer = locale.messages.answers.notify.deactivated
        } else {
            notifyList.push(user.id)
            answer = locale.messages.answers.notify.activated
        }

        answer = answer.replace(/\${username}/g, user.tag)

        await databaseUtil.updateDatabaseEntry('notify', notifyList)

        void interaction.reply(answer)
    }
}