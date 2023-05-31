import {Message, MessageEmbed, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {formatTime} from "../../../../helper/DataHelper";

export class EmbedHandler {
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected embedHelper = new EmbedHelper()
    protected metadataHelper = new MetadataHelper()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (typeof data.embed === 'undefined') {
            return
        }

        if (interaction !== null && !interaction.replied && !interaction.deferred) {
            await interaction.deferReply()
        }

        await message.edit({components: null, embeds: null})
        await message.removeAttachments()

        const currentEmbed = message.embeds[0] as MessageEmbed

        const author = this.embedHelper.getAuthorName(currentEmbed)

        let metaData = {
            estimated_time: 'N/A',
            filename: 'N/A'
        }

        if (data.function_mapping.fetch_author_metadata) {
            metaData = await this.metadataHelper.getMetaData(author)

            if (interaction !== null && typeof metaData === 'undefined') {
                await interaction.editReply(this.locale.messages.errors.file_not_found)
                return
            }

            metaData.estimated_time = formatTime(metaData.estimated_time)
            metaData.filename = author
        }

        const embedData = await this.embedHelper.generateEmbed(data.function_mapping.show_embed, metaData)

        if (data.function_mapping.fetch_author_thumbnail) {
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