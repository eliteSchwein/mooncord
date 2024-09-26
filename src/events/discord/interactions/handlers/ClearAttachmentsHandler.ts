import BaseHandler from "../abstracts/BaseHandler";
import {Message, User} from "discord.js";

export class ClearAttachmentsHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        return data.functions.includes("clearAttachments");
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        await message.removeAttachments()
    }
}