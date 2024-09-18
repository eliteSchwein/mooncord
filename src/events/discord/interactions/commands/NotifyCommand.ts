import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {removeFromArray} from "../../../../helper/DataHelper";

export default class NotifyCommand extends BaseCommand {
    commandId = 'notify'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const notifyList = this.database.getDatabaseEntry('notify')

        const user = interaction.user

        let answer

        if (notifyList.includes(user.id)) {
            removeFromArray(notifyList, user.id)
            answer = this.locale.messages.answers.notify.deactivated
        } else {
            notifyList.push(user.id)
            answer = this.locale.messages.answers.notify.activated
        }

        answer = answer.replace(/\${username}/g, user.tag)

        await this.database.updateDatabaseEntry('notify', notifyList)

        void interaction.reply(answer)
    }
}