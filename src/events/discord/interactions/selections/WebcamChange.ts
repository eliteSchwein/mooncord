import {SelectMenuInteraction} from "discord.js";
import {getEntry, setData} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import BaseSelection from "./BaseSelection";

export class WebcamChange extends BaseSelection{
    selectionId = 'status_webcam'

    async handleSelection(interaction: SelectMenuInteraction) {
        await interaction.deferReply()
        const webcamCache = getEntry('webcam')
        const functionCache = getEntry('function')

        const newCam = interaction.values[0]

        webcamCache.active = newCam

        setData('webcam', webcamCache)

        const currentStatus = functionCache.current_status
        const currentStatusMeta = this.config.getStatusMeta()[currentStatus]

        const message = await this.embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await interaction.editReply(message.embed)
    }
}