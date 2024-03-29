'use strict'

import {Message, User} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";

export class ListHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        const listId = data.list
        if (!listId) {
            return
        }

        if (interaction !== null && !interaction.replied && !interaction.deferred) {
            await interaction.deferReply()
        }

        const embedHelper = new EmbedHelper()
        const pageHelper = new PageHelper(listId)
        const pageData = pageHelper.getPage(false, 2)

        const answer = await embedHelper.generateEmbed(listId, pageData)

        await message.edit({components: null})
        await message.removeAttachments()

        await message.edit(answer.embed)

        if (interaction !== null && !interaction.replied) {
            await interaction.deleteReply()
        }
    }
}