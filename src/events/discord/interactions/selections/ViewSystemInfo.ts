'use strict'

import {Message, SelectMenuInteraction} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {MCUHelper} from "../../../../helper/MCUHelper";

export class ViewSystemInfo {

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'systeminfo_select') {
            return
        }

        void this.execute(interaction)
    }

    private async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()
        const currentMessage = interaction.message as Message

        const embedHelper = new EmbedHelper()
        const mcuHelper = new MCUHelper()

        const component = interaction.values[0]

        let embedData: any

        if (component.startsWith('mcu')) {
            const mcuData = mcuHelper.getMCULoad(component)
            embedData = await embedHelper.generateEmbed(`systeminfo_mcu`, mcuData)
        } else {
            embedData = await embedHelper.generateEmbed(`systeminfo_${component}`)
        }

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit(embedData.embed)

        await interaction.deleteReply()
    }
}