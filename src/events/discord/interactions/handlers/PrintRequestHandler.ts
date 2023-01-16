import {ButtonInteraction, Message, MessageEmbed, User} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {formatTime} from "../../../../helper/DataHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class PrintRequestHandler {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected metadataHelper = new MetadataHelper()
    protected embedHelper = new EmbedHelper()

    public async execute(message: Message, user: User, data, interaction = null) {
        if(!data.function_mapping.request_printjob) { return }

        let embedId = 'printjob_start_request'

        if(typeof data.function_mapping.request_embed !== 'undefined') {
            embedId = data.function_mapping.request_embed
        }

        const currentEmbed = message.embeds[0] as MessageEmbed

        if(currentEmbed.author === null) {
            return
        }
        if(interaction !== null &&
            !interaction.replied &&
            !interaction.deferred) {
            await interaction.deferReply()
        }

        const printFile = this.embedHelper.getAuthorName(currentEmbed)

        const metadata = await this.metadataHelper.getMetaData(printFile)

        if(interaction !== null && typeof metadata === 'undefined') {
            await interaction.editReply(this.locale.messages.errors.file_not_found)
            return
        }

        const thumbnail = await this.metadataHelper.getThumbnail(printFile)

        metadata.estimated_time = formatTime(metadata.estimated_time)
        metadata.filename = printFile

        const embedData = await this.embedHelper.generateEmbed(embedId, metadata)
        const embed = embedData.embed.embeds[0] as MessageEmbed

        embed.setThumbnail(`attachment://${thumbnail.name}`)

        embedData.embed.embeds = [embed]
        embedData.embed['files'] = [thumbnail]

        await message.edit({components: null})
        await message.removeAttachments()

        await message.edit(embedData.embed)

        if(interaction !== null && !interaction.replied) {
            await interaction.deleteReply()
        }
    }
}