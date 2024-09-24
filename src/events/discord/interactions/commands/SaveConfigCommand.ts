import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {logRegular} from "../../../../helper/LoggerHelper";

export default class SaveConfigCommand extends BaseCommand {
    commandId = 'saveconfig'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        logRegular('saving configuration...')

        await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `SAVE_CONFIG`}})

        await interaction.editReply(this.locale.messages.answers.config_save
            .replace(/(\${username})/g, interaction.user.tag))
    }
}