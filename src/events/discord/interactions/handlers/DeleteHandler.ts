'use strict'

import {Message, User} from "discord.js";
import BaseHandler from "../abstracts/BaseHandler";

export class DeleteHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("delete")) {
            return false
        }
        if (typeof data.root_path === 'undefined') {
            return false
        }

        return true
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        const currentEmbed = message.embeds[0]

        if (currentEmbed.author === null) {
            return
        }

        const filename = this.embedHelper.getAuthorName(currentEmbed)

        if (interaction !== null &&
            !interaction.replied &&
            !interaction.deferred) {
            await interaction.deferReply()
        }

        const rootPath = data.root_path

        const feedback = await this.moonrakerClient.send({
            "method": "server.files.delete_file",
            "params": {"path": `${rootPath}/${filename}`}
        })

        if (interaction !== null && typeof feedback.error !== 'undefined') {
            await interaction.editReply(this.locale.messages.errors.file_not_found)
            return
        }

        const answer = this.locale.messages.answers.file_deleted
            .replace(/(\${root})/g, rootPath)
            .replace(/(\${filename})/g, filename)

        await message.edit({content: answer, components: [], embeds: []})
    }
}