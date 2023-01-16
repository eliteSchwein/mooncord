import {ButtonInteraction, Message, MessageEmbed, MessageReaction, PartialMessageReaction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class DeleteReaction {
    public async execute(interaction: MessageReaction | PartialMessageReaction, reactionId) {
        if(reactionId !== 'delete') { return }

        await interaction.message.delete()
    }
}