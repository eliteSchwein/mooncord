import {Message, User} from "discord.js";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export default class DownloadHandler {
    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("download")) {
            return
        }
        if(message.embeds.length === 0) {
            return
        }
        if (typeof data.root_path === 'undefined') {
            return
        }

        const configHelper = new ConfigHelper()
        const embedHelper = new EmbedHelper()

        const fileName = embedHelper.getAuthorName(message.embeds[0])

    }
}