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
    protected timelapseHelper = new TimelapseHelper()
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'timelapse_download') {
            return
        }

        void this.execute(interaction)
    }

    protected async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()

        const timelapseFile = findValueByPartial(getEntry('timelapse_files'), interaction.values[0], 'path')

        const placeholderMessage = this.locale.messages.answers.timelapse_render
            .replace(/(\${timelapsefile})/g, timelapseFile)

        const placeholderImage = new MessageAttachment(
            resolve(__dirname, `../assets/icon-sets/${this.configHelper.getIconSet()}/timelapse-render.png`),
            'snapshot-error.png'
        )

        const currentMessage = interaction.message as Message

        await currentMessage.removeAttachments()
        await currentMessage.edit({content: placeholderMessage, components: [], embeds: [], files: [placeholderImage]})

        await interaction.deleteReply()

        const timelapseMessage = this.locale.messages.answers.timelapse_download
            .replace(/(\${timelapsefile})/g, timelapseFile)

        const timelapseContent = await this.timelapseHelper.downloadTimelapse(timelapseFile, timelapseMessage)

        await currentMessage.edit(timelapseContent.message)

        unlinkSync(timelapseContent.path)

        if (global.gc) {
            global.gc()
        }
    }
}