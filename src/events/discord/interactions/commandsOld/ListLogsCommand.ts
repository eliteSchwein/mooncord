'use strict'

import {CommandInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {mergeDeep} from "../../../../helper/DataHelper";

export class ListLogsCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'listlogs') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const localeHelper = new LocaleHelper()
        const embedHelper = new EmbedHelper()

        await interaction.deferReply()

        const pageHelper = new PageHelper('log_files')
        const pageData = pageHelper.getPage(false, 2)

        if (Object.keys(pageData) === undefined || Object.keys(pageData).length === 0) {
            await interaction.editReply(localeHelper.getLocale().messages.errors.no_logs
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        const data = mergeDeep(pageData, {'select_max_value': 5})

        const embed = await embedHelper.generateEmbed('log_files', data)

        await interaction.editReply(embed.embed)
    }
}