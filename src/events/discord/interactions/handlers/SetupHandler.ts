'use strict'

import {Message, User} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {logRegular} from "../../../../helper/LoggerHelper";
import BaseHandler from "../abstracts/BaseHandler";

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