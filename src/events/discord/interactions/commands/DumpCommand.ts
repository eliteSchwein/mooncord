import BaseCommand from "./BaseCommand";
import {AttachmentBuilder, ChatInputCommandInteraction} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import path from "path";

export default class DumpCommand extends BaseCommand {
    commandId = 'dump'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ephemeral: true})

        const sectionArgument = interaction.options.getString(this.syntaxLocale.commands.dump.options.section.name)

        if (sectionArgument === 'cache') {
            void await CacheUtil.dump()
        } else if (sectionArgument === 'database') {
            void await this.database.dump()
        }

        const attachment = new AttachmentBuilder(path.resolve(__dirname, `../${sectionArgument}_dump.json`), {name: `${sectionArgument}.json`})

        await interaction.editReply({files: [attachment]})
    }
}