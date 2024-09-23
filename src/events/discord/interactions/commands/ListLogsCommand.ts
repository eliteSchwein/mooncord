import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {PageHelper} from "../../../../helper/PageHelper";
import {mergeDeep} from "../../../../helper/DataHelper";

export default class ListLogsCommand extends BaseCommand {
    commandId = 'listlogs'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()

        const pageHelper = new PageHelper('log_files')
        const pageData = pageHelper.getPage(false, 2)

        if (Object.keys(pageData) === undefined || Object.keys(pageData).length === 0) {
            await interaction.editReply(this.locale.messages.errors.no_logs
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        const data = mergeDeep(pageData, {'select_max_value': 5})

        const embed = await this.embedHelper.generateEmbed('log_files', data)

        await interaction.editReply(embed.embed)
    }
}