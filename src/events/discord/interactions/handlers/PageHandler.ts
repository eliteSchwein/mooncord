'use strict'

import {Message, User} from "discord.js";
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
        let embedData = this.embedHelper.getRawEmbedByTitle(embed.title)

        if (typeof embedData === 'undefined') {
            return
        }

        const filterFooter = embedData.embedData.footer.replace(/(\${pages})/g, '')

        if(embedData.embedData.page_embed_parent) {
            embedData = {
                embedID: embedData.embedData.page_embed_parent,
                embedData: this.config.getEntriesByFilter(new RegExp(`^embed ${embedData.embedData.page_embed_parent}`, 'g'))[0]
            }
        }

        const pages = embed.footer.text.replace(filterFooter, '').split('/')
        const currentPage = Number.parseInt(pages[0])
        const pageHelper = new PageHelper(embedData.embedID)

        const pageData = await pageHelper.getPage(data.functions.includes("page_up"), currentPage)

        if (!pageData) {
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

        await message.edit({components: null})
        await message.removeAttachments()

        await message.edit(pageData.embed)

        if (interaction !== null && !interaction.replied) {
            await interaction.deleteReply()
        }

        return
    }
}