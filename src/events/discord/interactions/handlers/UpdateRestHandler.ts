import BaseHandler from "../abstracts/BaseHandler";
import {Message, User} from "discord.js";
import {updateRestEndpoint} from "../../../../helper/RestApiHelper";

export class UpdateRestHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        if (!data.update_rest_cache) {
            return false
        }
        return true
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        if (interaction !== null && !interaction.deferred && !interaction.replied) {
            await interaction.deferReply()
        }

        for (const key of data.update_rest_cache) {
            await updateRestEndpoint(key)
        }
    }
}