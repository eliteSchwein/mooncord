'use strict'

import {Message, StringSelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {findValueByPartial} from "../../../../helper/DataHelper";
import BaseSelection from "../abstracts/BaseSelection";
import {formatTime} from "../../../../utils/FormatUtil";

export class ViewPrintJobSelection extends BaseSelection {
    selectionId = 'printlist_view_printjob'

    async handleSelection(interaction: StringSelectMenuInteraction) {
        const gcodeFile = findValueByPartial(getEntry('gcode_files'), interaction.values[0], 'path')

        const metadata = await this.metadataHelper.getMetaData(gcodeFile)

        if (typeof metadata === 'undefined') {
            await interaction.editReply(this.locale.messages.errors.file_not_found)
            return
        }

        const thumbnail = await this.metadataHelper.getThumbnail(gcodeFile)

        metadata.filename = gcodeFile

        const embedData = await this.embedHelper.generateEmbed('fileinfo', metadata)
        const embed = embedData.embed.embeds[0]

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