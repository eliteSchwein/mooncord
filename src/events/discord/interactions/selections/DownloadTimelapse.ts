'use strict'

import {Message, MessageAttachment, SelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {findValueByPartial} from "../../../../helper/DataHelper";
import {TimelapseHelper} from "../../../../helper/TimelapseHelper";
import {resolve} from "path";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {unlinkSync} from "fs";

export class DownloadTimelapse {

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'timelapse_download') {
            return
        }

        void this.execute(interaction)
    }

    private async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()
        const timelapseHelper = new TimelapseHelper()
        const localeHelper = new LocaleHelper()
        const configHelper = new ConfigHelper()
        const locale = localeHelper.getLocale()

        const timelapseFile = findValueByPartial(getEntry('timelapse_files'), interaction.values[0], 'path')

        const placeholderMessage = locale.messages.answers.timelapse_render
            .replace(/(\${timelapsefile})/g, timelapseFile)

        const placeholderImage = new MessageAttachment(
            resolve(__dirname, `../assets/icon-sets/${configHelper.getIconSet()}/timelapse-render.png`),
            'snapshot-error.png'
        )

        const currentMessage = interaction.message as Message

        await currentMessage.removeAttachments()
        await currentMessage.edit({content: placeholderMessage, components: [], embeds: [], files: [placeholderImage]})

        await interaction.deleteReply()

        const timelapseMessage = locale.messages.answers.timelapse_download
            .replace(/(\${timelapsefile})/g, timelapseFile)

        const timelapseContent = await timelapseHelper.downloadTimelapse(timelapseFile, timelapseMessage)

        await currentMessage.edit(timelapseContent.message)

        unlinkSync(timelapseContent.path)

        if (global.gc) {
            global.gc()
        }
    }
}