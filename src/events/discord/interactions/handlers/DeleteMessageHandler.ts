'use strict'

import {Message, User} from "discord.js";
import BaseHandler from "./BaseHandler";

export class DeleteMessageHandler extends BaseHandler{
    async isValid(message: Message, user: User, data, interaction = null) {
        return data.functions.includes("delete_message");
    }

    public async handleHandler(message: Message, user: User, data, interaction = null) {
        await message.delete()
    }
}