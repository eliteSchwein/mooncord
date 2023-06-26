'use strict'

import {Message, MessageEmbed, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {formatTime} from "../../../../helper/DataHelper";

export class EmbedHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (typeof data.embed === 'undefined') {
            return
        }

        if (interaction !== null && !interaction.replied && !interaction.deferred) {
            await interaction.deferReply()
        }

        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const embedHelper = new EmbedHelper()
        const metadataHelper = new MetadataHelper()

        await message.edit({components: null, embeds: null})
        await message.removeAttachments()

        const currentEmbed = message.embeds[0] as MessageEmbed

        let author = ''

        if(currentEmbed !== undefined) {
            author = embedHelper.getAuthorName(currentEmbed)
        }

        let metaData = {
            estimated_time: 'N/A',
            filename: 'N/A'
        }

        if (data.functions.includes('fetch_author_metadata')) {
            metaData = await metadataHelper.getMetaData(author)

            if (interaction !== null && typeof metaData === 'undefined') {
                await interaction.editReply(locale.messages.errors.file_not_found)
                return
            }

            metaData.estimated_time = formatTime(metaData.estimated_time)
            metaData.filename = author
        }

        const embedData = await embedHelper.generateEmbed(data.embed, metaData)

        if (data.functions.includes('fetch_author_metadata')) {
            const thumbnail = await metadataHelper.getThumbnail(author)

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