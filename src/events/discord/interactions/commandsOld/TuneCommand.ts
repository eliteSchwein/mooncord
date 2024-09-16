'use strict'

import {CommandInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class TuneCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'tune') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const localeHelper = new LocaleHelper()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const locale = localeHelper.getLocale()
        const functionCache = getEntry('function')
        const moonrakerClient = getMoonrakerClient()
        const speed = interaction.options.getInteger(syntaxLocale.commands.tune.options.speed.name)
        const flow = interaction.options.getInteger(syntaxLocale.commands.tune.options.flow.name)
        let message = ''

        if (functionCache.current_status !== 'printing') {
            const message = locale.messages.answers.printjob_pause.status_not_valid
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.reply(message)
            return
        }

        await interaction.deferReply()

        if (speed === null && flow === null) {
            await interaction.editReply(locale.messages.errors.missing_arguments
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        if (speed !== null) {
            await moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `M220 S${speed}`}})
            message = 'speed'
        }

        if (flow !== null) {
            await moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `M221 S${flow}`}})
            message = 'flow'
        }

        if (flow !== null && speed !== null) {
            message = 'speed_flow'
        }

        await interaction.editReply(locale.messages.answers.tune[message]
            .replace(/(\${username})/g, interaction.user.tag)
            .replace(/(\${speed})/g, speed)
            .replace(/(\${flow})/g, flow))
    }
}