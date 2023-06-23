'use strict'

import {CommandInteraction, MessageEmbed} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {formatTime} from "../../../../helper/DataHelper";

export class FileInfoCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'fileinfo') {
            return
        }

        void this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const metadataHelper = new MetadataHelper()
        const embedHelper = new EmbedHelper()

        let filename = interaction.options.getString(syntaxLocale.commands.fileinfo.options.file.name)

        if (!filename.endsWith('.gcode')) {
            filename = `${filename}.gcode`
        }

        const metadata = await metadataHelper.getMetaData(filename)

        if (typeof metadata === 'undefined') {
            await interaction.reply(locale.messages.errors.file_not_found)
            return
        }

        metadata.estimated_time = formatTime(metadata.estimated_time)
        metadata.filename = filename

        const thumbnail = await metadataHelper.getThumbnail(filename)

        const embedData = await embedHelper.generateEmbed('fileinfo', metadata)
        const embed = embedData.embed.embeds[0] as MessageEmbed

        embed.setThumbnail(`attachment://${thumbnail.name}`)

        embedData.embed.embeds = [embed]
        embedData.embed['files'] = [thumbnail]

        await interaction.reply(embedData.embed)
    }
}