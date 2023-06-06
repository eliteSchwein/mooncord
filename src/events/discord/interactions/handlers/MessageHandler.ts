import {Message, User} from "discord.js";
import {findValue} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class MessageHandler {
    protected embedHelper = new EmbedHelper()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (typeof data.message === 'undefined') {
            return
        }

        const embed = message.embeds[0]

        let label = data.label

        if (typeof data.emoji !== 'undefined') {
            label = `${data.emoji} ${label}`
        }

        let newMessage = data.message

        if (/(\${).*?}/g.test(newMessage)) {
            const placeholderId = newMessage
                .replace(/(\${)/g, '')
                .replace(/}/g, '')

            newMessage = findValue(placeholderId)
        }

        newMessage = newMessage
            .replace(/(\${username})/g, interaction.user.tag)
            .replace(/(\${button_label})/g, label)
            .replace(/(\${embed_author})/g, this.embedHelper.getAuthorName(embed))
            .replace(/(\${embed_title})/g, this.embedHelper.getTitle(embed))


        if (interaction !== null && interaction.replied) {
            await interaction.followUp(newMessage)
        } else {
            if (data.functions.includes('message_as_follow_up')) {
                await message.reply(newMessage)
                return
            }

            if(interaction !== null &&
                interaction.deferred) {
                await interaction.editReply(newMessage)
                return
            }

            await message.edit({components: null, embeds: null})
            await message.removeAttachments()

            if (interaction !== null) {
                await interaction.update({content: newMessage, components: [], embeds: []})
                return
            }
            await message.edit({content: newMessage, components: [], embeds: []})
        }
    }
}