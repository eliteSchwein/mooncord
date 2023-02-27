import {CommandInteraction, MessageEmbed} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {formatTime} from "../../../../helper/DataHelper";

export class FileInfoCommand {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected metadataHelper = new MetadataHelper()
    protected embedHelper = new EmbedHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'fileinfo') {
            return
        }

        void this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        let filename = interaction.options.getString(this.syntaxLocale.commands.fileinfo.options.file.name)

        if (!filename.endsWith('.gcode')) {
            filename = `${filename}.gcode`
        }

        const metadata = await this.metadataHelper.getMetaData(filename)

        if (typeof metadata === 'undefined') {
            await interaction.reply(this.locale.messages.errors.file_not_found)
            return
        }

        metadata.estimated_time = formatTime(metadata.estimated_time)
        metadata.filename = filename

        const thumbnail = await this.metadataHelper.getThumbnail(filename)

        const embedData = await this.embedHelper.generateEmbed('fileinfo', metadata)
        const embed = embedData.embed.embeds[0] as MessageEmbed

        embed.setThumbnail(`attachment://${thumbnail.name}`)

        embedData.embed.embeds = [embed]
        embedData.embed['files'] = [thumbnail]

        await interaction.reply(embedData.embed)
    }
}