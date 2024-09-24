'use strict'

import {Message, StringSelectMenuInteraction} from "discord.js";
import {MCUHelper} from "../../../../helper/MCUHelper";
import BaseSelection from "../abstracts/BaseSelection";

export class ViewSystemInfo extends BaseSelection {
    selectionId = 'systeminfo_select'

    async handleSelection(interaction: StringSelectMenuInteraction) {
        const currentMessage = interaction.message as Message

        const mcuHelper = new MCUHelper()

        const component = interaction.values[0]

        let embedData: any

        if (component.startsWith('mcu')) {
            const mcuData = mcuHelper.getMCULoad(component)
            embedData = await this.embedHelper.generateEmbed(`systeminfo_mcu`, mcuData)
        } else {
            embedData = await this.embedHelper.generateEmbed(`systeminfo_${component}`)
        }

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit(embedData.embed)

        await interaction.deleteReply()
    }
}