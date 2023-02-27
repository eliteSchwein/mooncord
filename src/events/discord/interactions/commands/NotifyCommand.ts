import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {removeFromArray} from "../../../../helper/DataHelper";

export class NotifyCommand {
    protected databaseUtil = getDatabase()
    protected notifyList = this.databaseUtil.getDatabaseEntry('notify')
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'notify') {
            return
        }

        const user = interaction.user

        let answer

        if (this.notifyList.includes(user.id)) {
            removeFromArray(this.notifyList, user.id)
            answer = this.locale.messages.answers.notify.deactivated
        } else {
            this.notifyList.push(user.id)
            answer = this.locale.messages.answers.notify.activated
        }

        answer = answer.replace(/\${username}/g, user.tag)

        this.databaseUtil.updateDatabaseEntry('notify', this.notifyList)

        void interaction.reply(answer)
    }
}