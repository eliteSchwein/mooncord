import {ButtonInteraction, Message, MessageEmbed} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {formatTime} from "../../../../helper/DataHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class PrintRequestButton {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected metadataHelper = new MetadataHelper()
    protected embedHelper = new EmbedHelper()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(!buttonData.function_mapping.request_printjob) { return }

        let embedId = 'printjob_start_request'

        if(typeof buttonData.function_mapping.request_embed !== 'undefined') {
            embedId = buttonData.function_mapping.request_embed
        }

        const currentEmbed = interaction.message.embeds[0] as MessageEmbed

        if(currentEmbed.author === null) {
            return
        }

        if(!interaction.replied &&
            !interaction.deferred) {
            await interaction.deferReply()
        }

        const printFile = this.embedHelper.getAuthorName(currentEmbed)

        const metadata = await this.metadataHelper.getMetaData(printFile)

        if(typeof metadata === 'undefined') {
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

        const currentMessage = interaction.message as Message

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit(embedData.embed)

        if(!interaction.replied) {
            await interaction.deleteReply()
        }
    }
}