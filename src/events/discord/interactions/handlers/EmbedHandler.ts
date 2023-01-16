import {ButtonInteraction, Message, MessageEmbed, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class EmbedHandler {
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected embedHelper = new EmbedHelper()

    public async execute(message: Message, user: User, data, interaction = null) {
        if(typeof data.function_mapping.show_embed === 'undefined') { return }

        if(interaction !== null && !interaction.replied && !interaction.deferred) { await interaction.deferReply() }

        await message.edit({components: null, embeds: null})
        await message.removeAttachments()

        const embed = await this.embedHelper.generateEmbed(data.function_mapping.show_embed)

        await message.edit(embed.embed)

        if(interaction === null || !interaction.deferred) { return }

        await interaction.deleteReply()
    }
}