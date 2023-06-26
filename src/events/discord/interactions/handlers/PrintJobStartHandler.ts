'use strict'

import {Message, User} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {getMoonrakerClient} from "../../../../Application";

export class PrintJobStartHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("start_print")) {
            return
        }

        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const metadataHelper = new MetadataHelper()
        const embedHelper = new EmbedHelper()
        const moonrakerClient = getMoonrakerClient()

        const embed = message.embeds[0]

        const printFile = embedHelper.getAuthorName(embed)

        const metadata = await metadataHelper.getMetaData(printFile)

        if (typeof metadata === 'undefined') {
            if (interaction !== null) {
                await interaction.editReply(locale.messages.errors.file_not_found)
            } else {
                await message.reply(locale.messages.errors.file_not_found)
            }
            return
        }

        await moonrakerClient.send({"method": "printer.print.start", "params": {"filename": printFile}})
    }
}