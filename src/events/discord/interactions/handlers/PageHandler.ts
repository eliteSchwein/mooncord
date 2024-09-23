'use strict'

import {Message, User} from "discord.js";
import {getDatabase} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {logNotice} from "../../../../helper/LoggerHelper";
import BaseHandler from "../abstracts/BaseHandler";

export class PageHandler extends BaseHandler{
    async isValid(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("page_up") &&
            !data.functions.includes("page_down")) {
            return false
        }

        if (message.embeds.length === 0) {
            return false
        }

        return true
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        if (interaction !== null &&
            !interaction.replied &&
            !interaction.deferred) {
            await interaction.deferReply()
        }

        const embed = message.embeds[0]
        const embedData = this.embedHelper.getRawEmbedByTitle(embed.title)

        if (typeof embedData === 'undefined') {
            return
        }

        const filterFooter = embedData.embedData.footer.replace(/(\${pages})/g, '')

        const pages = embed.footer.text.replace(filterFooter, '').split('/')
        const currentPage = Number.parseInt(pages[0])
        const pageHelper = new PageHelper(embedData.embedID)

        const pageData = pageHelper.getPage(data.functions.includes("page_up"), currentPage)

        if (Object.keys(pageData).length === 0) {
            if (interaction.replied) {
                await interaction.editReply(this.locale.messages.errors.no_entries
                    .replace(/(\${username})/g, interaction.user.tag))
            } else {
                await message.reply(this.locale.messages.errors.no_entries
                    .replace(/(\${username})/g, interaction.user.tag))
            }
            return
        }

        logNotice(`select Page ${pageData.pages} for ${embedData.embedID}`)

        const answer = await this.embedHelper.generateEmbed(embedData.embedID, pageData)

        await message.edit({components: null})
        await message.removeAttachments()

        await message.edit(answer.embed)

        if (interaction !== null && !interaction.replied) {
            await interaction.deleteReply()
        }
    }
}