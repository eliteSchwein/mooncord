'use strict'

import {Message, User} from "discord.js";
import BaseHandler from "../abstracts/BaseHandler";

export class PrintJobStartHandler extends BaseHandler{
    async isValid(message: Message, user: User, data, interaction = null) {
        return data.functions.includes("start_print");
    }
    async handleHandler(message: Message, user: User, data, interaction = null) {
        const embed = message.embeds[0]

        const printFile = this.embedHelper.getAuthorName(embed)

        const metadata = await this.metadataHelper.getMetaData(printFile)

        if (typeof metadata === 'undefined') {
            if (interaction !== null) {
                await interaction.editReply(this.locale.messages.errors.file_not_found)
            } else {
                await message.reply(this.locale.messages.errors.file_not_found)
            }
            return
        }

        await this.moonrakerClient.send({"method": "printer.print.start", "params": {"filename": printFile}})
    }
}