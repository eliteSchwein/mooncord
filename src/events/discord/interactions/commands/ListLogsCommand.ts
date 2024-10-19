import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {PageHelper} from "../../../../helper/PageHelper";
import {mergeDeep} from "../../../../helper/DataHelper";

export default class ListLogsCommand extends BaseCommand {
    commandId = 'listlogs'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const pageHelper = new PageHelper('log_files')
        const pageData = await pageHelper.getPage(false, 2)

        if (!pageData) {
            await interaction.editReply(this.locale.messages.errors.no_logs
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        await interaction.editReply(pageData.embed)
    }
}