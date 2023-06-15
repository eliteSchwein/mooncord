import {Message, MessageEmbed, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {getEntry} from "../../../../utils/CacheUtil";
import {logRegular} from "../../../../helper/LoggerHelper";

export class SetupHandler {
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected embedHelper = new EmbedHelper()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("setup_close")) {
            return
        }

        if(!getEntry('setup_mode')) {
            return
        }

        logRegular('finish MoonCord installation now, Happy Printing!')

        process.exit(0)
    }
}