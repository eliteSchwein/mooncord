'use strict'

import {Message, User} from "discord.js";
import {findValue} from "../../../../utils/CacheUtil";
import BaseHandler from "../abstracts/BaseHandler";

export class WaitMessageHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        return typeof data.wait_message !== 'undefined';
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        const embed = message.embeds[0]

        let label = data.label

        if (typeof data.emoji !== 'undefined') {
            label = `${data.emoji} ${label}`
        }

        let newMessage = data.wait_message

        if (/(\${).*?}/g.test(newMessage)) {
            const placeholderId = newMessage
                .replace(/(\${)/g, '')
                .replace(/}/g, '')

            newMessage = findValue(placeholderId)
        }

        newMessage = newMessage
            .replace(/(\${username})/g, interaction.user.tag)
            .replace(/(\${button_label})/g, label)
            .replace(/(\${embed_author})/g, this.embedHelper.getAuthorName(embed))
            .replace(/(\${embed_title})/g, this.embedHelper.getTitle(embed))

        if (data.functions.includes('message_as_follow_up')) {
            await message.reply(newMessage)
            return
        }

        if (interaction.deferred) {
            await interaction.editReply(newMessage)
            return
        }

        await message.edit({components: null, embeds: null})
        await message.removeAttachments()

        await interaction.update({content: newMessage, components: [], embeds: []})
        return
    }
}