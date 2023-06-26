'use strict'

import {Message, User} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {getMoonrakerClient} from "../../../../Application";

export class ExcludeConfirmHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("exclude_object")) {
            return
        }

        if (interaction !== null && !interaction.deferred && !interaction.replied) {
            await interaction.deferReply()
        }

        const moonrakerClient = getMoonrakerClient()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()

        const objectOptions = interaction.message.components[0].components[0]['options']
        let object = undefined

        for (const objectOption of objectOptions) {
            if (objectOption.default) {
                object = objectOption.value
            }
        }

        await moonrakerClient.send({
            "method": "printer.gcode.script",
            "params": {"script": `EXCLUDE_OBJECT NAME=${object}`}
        }, Number.POSITIVE_INFINITY)

        const answer = locale.messages.answers.excluded_object
            .replace(/(\${object})/g, object)
            .replace(/(\${username})/g, interaction.user.username)

        if (interaction !== null && !interaction.replied) {
            await interaction.editReply(answer)
        } else if (interaction !== null) {
            await interaction.followUp(answer)
        } else {
            await message.reply(answer)
        }
    }
}