'use strict'

import type {Message, SelectMenuInteraction} from "discord.js";

import {TempHelper} from "../../../../helper/TempHelper";
import TempHistoryGraph from "../../../../helper/graphs/TempHistoryGraph";
import BaseSelection from "./BaseSelection";

export class ShowTempSelection extends BaseSelection{
    selectionId = 'show_temp'

    async handleSelection(interaction: SelectMenuInteraction) {
        await interaction.deferReply()

        const tempHelper = new TempHelper()

        const heater = interaction.values[0]
        const temps = tempHelper.parseFields().fields
        let tempField = {}

        for (const temp of temps) {
            if (temp.name.endsWith(heater)) {
                tempField = temp
            }
        }

        const embedData = await this.embedHelper.generateEmbed('single_temperature', {heater}, [tempField])
        const tempGraph = await new TempHistoryGraph().renderGraph(heater)
        const embed = embedData.embed.embeds[0]
        const components = embedData.embed['components']
        let files = [tempGraph]

        if (typeof embedData.embed['files'] !== 'undefined') {
            files = [...files, ...embedData.embed['files']]
        }

        embed.setImage(`attachment://${tempGraph.name}`)

        const currentMessage = interaction.message as Message
        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit({embeds: [embed], files, components})

        await interaction.deleteReply()
    }
}