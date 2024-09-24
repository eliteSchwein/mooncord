import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {PageHelper} from "../../../../helper/PageHelper";

export default class GcodeListCommand extends BaseCommand {
    commandId = 'listgcodes'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const pageHelper = new PageHelper('gcode_files')
        const pageData = pageHelper.getPage(false, 2)

        if (Object.keys(pageData) === undefined || Object.keys(pageData).length === 0) {
            await interaction.editReply(this.locale.messages.errors.no_gcodes
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        const embed = await this.embedHelper.generateEmbed('gcode_files', pageData)

        await interaction.editReply(embed.embed)
    }
}