import {Message, SelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {findValueByPartial, formatTime} from "../../../../helper/DataHelper";
import {TimelapseHelper} from "../../../../helper/TimelapseHelper";

export class DownloadTimelapse {
    protected timelapseHelper = new TimelapseHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if(selectionId !== 'timelapse_download') { return }

        void this.execute(interaction)
    }

    protected async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()

        const timelapseFile = findValueByPartial(getEntry('timelapse_files'), interaction.values[0], 'path')

        const timelapseMessage = this.locale.messages.answers.timelapse_download
            .replace(/(\${timelapsefile})/g, timelapseFile)

        const timelapseContent = await this.timelapseHelper.downloadTimelapse(timelapseFile, timelapseMessage)

        const currentMessage = interaction.message as Message

        await currentMessage.removeAttachments()
        await currentMessage.edit({components: timelapseContent.components, embeds: []})

        await currentMessage.edit(timelapseContent)

        await interaction.deleteReply()

        if (global.gc) {
            global.gc()
        }
    }
}