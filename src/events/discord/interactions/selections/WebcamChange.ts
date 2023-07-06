import {SelectMenuInteraction} from "discord.js";
import {getEntry, setData} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";

export class WebcamChange {

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'status_webcam') {
            return
        }

        void this.execute(interaction)
    }


    private async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()
        const webcamCache = getEntry('webcam')
        const functionCache = getEntry('function')

        const newCam = interaction.values[0]
        const embedHelper = new EmbedHelper()
        const configHelper = new ConfigHelper()

        webcamCache.active = newCam

        setData('webcam', webcamCache)

        const currentStatus = functionCache.current_status
        const currentStatusMeta = configHelper.getStatusMeta()[currentStatus]

        const message = await embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await interaction.editReply(message.embed)
    }
}