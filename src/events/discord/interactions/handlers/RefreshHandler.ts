'use strict'

import {Message, User} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class RefreshHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes('refresh_status')) {
            return
        }

        const embedHelper = new EmbedHelper()
        const configHelper = new ConfigHelper()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const functionCache = getEntry('function')

        const waitMessage = locale.messages.answers.status_update
            .replace(/(\${username})/g, interaction.user.tag)

        if (interaction !== null) {
            if (interaction.replied) {
                await interaction.followUp({ephemeral: true, content: waitMessage})
            } else {
                await interaction.update({components: null, content: waitMessage})
            }
        }

        const currentStatus = functionCache.current_status
        const currentStatusMeta = configHelper.getStatusMeta()[currentStatus]

        await message.edit({components: null})

        const newMessage = await embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await message.removeAttachments()
        await message.edit(newMessage.embed)
    }
}