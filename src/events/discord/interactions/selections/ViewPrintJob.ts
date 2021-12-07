import {ButtonInteraction, Message, MessageEmbed, SelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logNotice} from "../../../../helper/LoggerHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {formatTime} from "../../../../helper/DataHelper";

export class ViewPrintJobSelection {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected metadataHelper = new MetadataHelper()

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if(selectionId !== 'printlist_view_printjob') { return }

        void this.execute(interaction)
    }

    protected async execute(interaction: SelectMenuInteraction) {
        const metadata = await this.metadataHelper.getMetaData(interaction.values[0])
        const thumbnail = await this.metadataHelper.getThumbnail(interaction.values[0])

        metadata.estimated_time = formatTime(metadata.estimated_time)
        
        const embedData = await this.embedHelper.generateEmbed('fileinfo', metadata)
        const embed = embedData.embed.embeds[0] as MessageEmbed

        embed.setThumbnail(`attachment://${thumbnail.name}`)

        const currentMessage = interaction.message as Message

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        if(interaction.replied) {
            await currentMessage.edit({embeds: [embed],
                files: [thumbnail],
                components: embedData.embed['components']})
        } else {
            await interaction.update({embeds: [embed],
                files: [thumbnail],
                components: embedData.embed['components']})
        }
    }
}