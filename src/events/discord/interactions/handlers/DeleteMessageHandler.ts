import {ButtonInteraction, Message, User} from "discord.js";
import * as App from '../../../../Application'

export class DeleteMessageHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if(!data.function_mapping.delete_message) { return }

        await message.delete()
    }
}