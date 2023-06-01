import {Message, MessageEmbed, User} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {removeFromArray} from "../../../../helper/DataHelper";

export class NotificationHandler {
    protected moonrakerClient = getMoonrakerClient()
    protected databaseUtil = getDatabase()
    protected notifyList = this.databaseUtil.getDatabaseEntry('notify')
    protected embedHelper = new EmbedHelper()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("notify_enable") && !data.functions.includes("notify_disable")) {
            return
        }

        if (!this.notifyList.includes(user.id) && data.functions.includes("notify_enable")) {
            this.notifyList.push(user.id)
        }

        if (this.notifyList.includes(user.id) && data.functions.includes("notify_disable")) {
            removeFromArray(this.notifyList, user.id)
        }

        await this.databaseUtil.updateDatabaseEntry('notify', this.notifyList)
    }
}