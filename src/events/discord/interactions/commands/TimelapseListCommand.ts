import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {PageHelper} from "../../../../helper/PageHelper";

export default class TimelapseListCommand extends BaseCommand {
    commandId = 'listtimelapses'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const pageHelper = new PageHelper('timelapse_files')
        const pageData = await pageHelper.getPage(false, 2)

        if (!pageData) {
            const message = this.locale.messages.errors.no_timelapses
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.editReply(message)
            return
        }

        await interaction.editReply(pageData.embed)
    }
}