'use strict'

import {Message, MessageEmbed, SelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {findValueByPartial, formatTime} from "../../../../helper/DataHelper";

export class ViewPrintJobSelection {
    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'printlist_view_printjob') {
            return
        }

        void this.execute(interaction)
    }

    private async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()

        const embedHelper = new EmbedHelper()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const metadataHelper = new MetadataHelper()

        const gcodeFile = findValueByPartial(getEntry('gcode_files'), interaction.values[0], 'path')

        const metadata = await metadataHelper.getMetaData(gcodeFile)

        if (typeof metadata === 'undefined') {
            await interaction.editReply(locale.messages.errors.file_not_found)
            return
        }

        const thumbnail = await metadataHelper.getThumbnail(gcodeFile)

        metadata.estimated_time = formatTime(metadata.estimated_time)
        metadata.filename = gcodeFile

        const embedData = await embedHelper.generateEmbed('fileinfo', metadata)
        const embed = embedData.embed.embeds[0] as MessageEmbed

        embed.setThumbnail(`attachment://${thumbnail.name}`)

        embedData.embed.embeds = [embed]
        embedData.embed['files'] = [thumbnail]

        const currentMessage = interaction.message as Message

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit(embedData.embed)

        await interaction.deleteReply()
    }
}