'use strict'

import {Message, User} from "discord.js";
import {formatTime} from "../../../../helper/DataHelper";
import BaseHandler from "../abstracts/BaseHandler";

export class EmbedHandler extends BaseHandler{
    async isValid(message: Message, user: User, data, interaction = null) {
        return typeof data.embed !== 'undefined';
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        if (interaction !== null && !interaction.replied && !interaction.deferred) {
            await interaction.deferReply()
        }

        await message.edit({components: null, embeds: null})
        await message.removeAttachments()

        const currentEmbed = message.embeds[0]

        let author = ''

        if(currentEmbed !== undefined) {
            author = this.embedHelper.getAuthorName(currentEmbed)
        }

        let metaData = {
            estimated_time: 'N/A',
            filename: 'N/A'
        }

        if (data.functions.includes('fetch_author_metadata')) {
            metaData = await this.metadataHelper.getMetaData(author)

            if (interaction !== null && typeof metaData === 'undefined') {
                await interaction.editReply(this.locale.messages.errors.file_not_found)
                return
            }

            metaData.estimated_time = formatTime(metaData.estimated_time)
            metaData.filename = author
        }

        const embedData = await this.embedHelper.generateEmbed(data.embed, metaData)

        if (data.functions.includes('fetch_author_metadata')) {
            const thumbnail = await this.metadataHelper.getThumbnail(author)

            embedData.embed.embeds[0].setThumbnail(`attachment://${thumbnail.name}`)
            embedData.embed['files'].push(thumbnail)
        }

        await message.edit(embedData.embed)

        if (interaction === null || !interaction.deferred) {
            return
        }

        await interaction.deleteReply()
    }
}