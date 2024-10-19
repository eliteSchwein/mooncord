'use strict'

import {Message, User} from "discord.js";
import {PageHelper} from "../../../../helper/PageHelper";
import BaseHandler from "../abstracts/BaseHandler";

export class ListHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        return true
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        const listId = data.list
        if (!listId) {
            return
        }

        if (interaction !== null && !interaction.replied && !interaction.deferred) {
            await interaction.deferReply()
        }

        const pageHelper = new PageHelper(listId)
        const pageData = await pageHelper.getPage(false, 2)

        await message.edit({components: null})
        await message.removeAttachments()

        await interaction.edit(pageData.embed)

        if (interaction !== null && !interaction.replied) {
            await interaction.deleteReply()
        }
    }
}