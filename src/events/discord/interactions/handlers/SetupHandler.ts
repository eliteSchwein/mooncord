'use strict'

import {Message, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {getEntry} from "../../../../utils/CacheUtil";
import {logRegular} from "../../../../helper/LoggerHelper";
import BaseHandler from "./BaseHandler";

export class SetupHandler extends BaseHandler{
    async isValid(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("setup_close")) {
            return false
        }

        if(!getEntry('setup_mode')) {
            return false
        }

        return true
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        logRegular('finish MoonCord installation now, Happy Printing!')

        process.exit(0)
    }
}