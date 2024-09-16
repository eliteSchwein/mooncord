'use strict'

import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class TimelapseListCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'listtimelapses') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const embedHelper = new EmbedHelper()

        const pageHelper = new PageHelper('timelapse_files')
        const pageData = pageHelper.getPage(false, 2)

        if (Object.keys(pageData) === undefined || Object.keys(pageData).length === 0) {
            const message = locale.messages.errors.no_timelapses
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.editReply(message)
            return
        }

        const embed = await embedHelper.generateEmbed('timelapse_files', pageData)

        await interaction.editReply(embed.embed)
    }
}