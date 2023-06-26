'use strict'

import type {Message, SelectMenuInteraction} from "discord.js";
import {MessageEmbed} from "discord.js";

import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {getEntry} from "../../../../utils/CacheUtil";
import {TempHelper} from "../../../../helper/TempHelper";
import TempHistoryGraph from "../../../../helper/graphs/TempHistoryGraph";

export class ShowTempSelection {

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'show_temp') {
            return
        }

        void this.execute(interaction)
    }

    private async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()

        const embedHelper = new EmbedHelper()
        const tempHelper = new TempHelper()

        const heater = interaction.values[0]
        const temps = tempHelper.parseFields().fields
        let tempField = {}

        for (const temp of temps) {
            if (temp.name.endsWith(heater)) {
                tempField = temp
            }
        }

        const embedData = await embedHelper.generateEmbed('single_temperature', {heater}, [tempField])
        const tempGraph = await new TempHistoryGraph().renderGraph(heater)
        const embed = embedData.embed.embeds[0] as MessageEmbed
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