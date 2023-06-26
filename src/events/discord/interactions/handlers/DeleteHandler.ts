'use strict'

import {Message, MessageEmbed, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class DeleteHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("delete")) {
            return
        }
        if (typeof data.root_path === 'undefined') {
            return
        }

        const moonrakerClient = getMoonrakerClient()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const embedHelper = new EmbedHelper()

        const currentEmbed = message.embeds[0] as MessageEmbed

        if (currentEmbed.author === null) {
            return
        }

        if (interaction !== null &&
            !interaction.replied &&
            !interaction.deferred) {
            await interaction.deferReply()
        }

        const rootPath = data.root_path
        const filename = embedHelper.getAuthorName(currentEmbed)

        const feedback = await moonrakerClient.send({
            "method": "server.files.delete_file",
            "params": {"path": `${rootPath}/${filename}`}
        })

        if (interaction !== null && typeof feedback.error !== 'undefined') {
            await interaction.editReply(locale.messages.errors.file_not_found)
            return
        }

        const answer = locale.messages.answers.file_deleted
            .replace(/(\${root})/g, rootPath)
            .replace(/(\${filename})/g, filename)

        await message.edit({content: answer, components: [], embeds: []})
    }
}