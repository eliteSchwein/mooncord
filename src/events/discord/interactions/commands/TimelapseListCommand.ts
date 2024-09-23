import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {PageHelper} from "../../../../helper/PageHelper";

export default class TimelapseListCommand extends BaseCommand {
    commandId = 'listtimelapses'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()

        const pageHelper = new PageHelper('timelapse_files')
        const pageData = pageHelper.getPage(false, 2)

        if (Object.keys(pageData) === undefined || Object.keys(pageData).length === 0) {
            const message = this.locale.messages.errors.no_timelapses
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.editReply(message)
            return
        }

        const embed = await this.embedHelper.generateEmbed('timelapse_files', pageData)

        await interaction.editReply(embed.embed)
    }
}