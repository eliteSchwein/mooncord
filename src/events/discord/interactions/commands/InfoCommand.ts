import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export default class InfoCommand extends BaseCommand {
    commandId = 'info'

    async handeCommand(interaction: ChatInputCommandInteraction) {
        const message = await new EmbedHelper().generateEmbed('info')

        void interaction.reply(message.embed)
    }
}