'use strict'

import {Message, User} from "discord.js";

export class DeleteMessageHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("delete_message")) {
            return
        }

        await message.delete()
    }
}