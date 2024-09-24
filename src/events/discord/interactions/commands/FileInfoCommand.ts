import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction, EmbedBuilder} from "discord.js";
import {formatTime} from "../../../../helper/DataHelper";

export class FileInfoCommand extends BaseCommand {
    commandId = 'fileinfo'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        let filename = interaction.options.getString(this.syntaxLocale.commands.fileinfo.options.file.name)

        if (!filename.endsWith('.gcode')) {
            filename = `${filename}.gcode`
        }

        const metadata = await this.metadataHelper.getMetaData(filename)

        if (typeof metadata === 'undefined') {
            await interaction.editReply(this.locale.messages.errors.file_not_found)
            return
        }

        metadata.estimated_time = formatTime(metadata.estimated_time)
        metadata.filename = filename

        const thumbnail = await this.metadataHelper.getThumbnail(filename)

        const embedData = await this.embedHelper.generateEmbed('fileinfo', metadata)
        const embed = embedData.embed.embeds[0] as EmbedBuilder

        embed.setThumbnail(`attachment://${thumbnail.name}`)

        embedData.embed.embeds = [embed]
        embedData.embed['files'] = [thumbnail]

        await interaction.editReply(embedData.embed)
    }
}