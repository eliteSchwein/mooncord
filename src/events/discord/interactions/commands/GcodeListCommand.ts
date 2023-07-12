'use strict'

import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class GcodeListCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'listgcodes') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const localeHelper = new LocaleHelper()
        const embedHelper = new EmbedHelper()

        await interaction.deferReply()

        const pageHelper = new PageHelper('gcode_files')
        const pageData = pageHelper.getPage(false, 2)

        if (Object.keys(pageData) === undefined || Object.keys(pageData).length === 0) {
            await interaction.editReply(localeHelper.getLocale().messages.errors.no_gcodes
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        const embed = await embedHelper.generateEmbed('gcode_files', pageData)

        await interaction.editReply(embed.embed)
    }
}