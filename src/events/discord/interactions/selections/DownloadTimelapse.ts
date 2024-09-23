'use strict'

import {AttachmentBuilder, Message, SelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {findValueByPartial} from "../../../../helper/DataHelper";
import {TimelapseHelper} from "../../../../helper/TimelapseHelper";
import {resolve} from "path";
import {unlinkSync} from "fs";
import BaseSelection from "./BaseSelection";

export class DownloadTimelapse extends BaseSelection {
    selectionId = 'timelapse_download'

    async handleSelection(interaction: SelectMenuInteraction) {
        await interaction.deferReply()
        const timelapseHelper = new TimelapseHelper()

        const timelapseFile = findValueByPartial(getEntry('timelapse_files'), interaction.values[0], 'path')

        const placeholderMessage = this.locale.messages.answers.timelapse_render
            .replace(/(\${timelapsefile})/g, timelapseFile)

        const placeholderImage = new AttachmentBuilder(
            resolve(__dirname, `../assets/icon-sets/${this.config.getIconSet()}/timelapse-render.png`),
            {name: 'snapshot-error.png'}
        )

        const currentMessage = interaction.message as Message

        await currentMessage.removeAttachments()
        await currentMessage.edit({content: placeholderMessage, components: [], embeds: [], files: [placeholderImage]})

        await interaction.deleteReply()

        const timelapseMessage = this.locale.messages.answers.timelapse_download
            .replace(/(\${timelapsefile})/g, timelapseFile)

        const timelapseContent = await timelapseHelper.downloadTimelapse(timelapseFile, timelapseMessage)

        await currentMessage.edit(timelapseContent.message)

        unlinkSync(timelapseContent.path)

        if (global.gc) {
            global.gc()
        }
    }
}