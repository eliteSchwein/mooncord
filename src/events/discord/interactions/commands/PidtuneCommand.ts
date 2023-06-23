'use strict'

import {CommandInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class PidtuneCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'pidtune') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const databaseUtil = getDatabase()
        const localeHelper = new LocaleHelper()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const locale = localeHelper.getLocale()
        const moonrakerClient = getMoonrakerClient()
        const functionCache = getEntry('function')

        const temp = interaction.options.getInteger(syntaxLocale.commands.pidtune.options.temperature.name)
        const heater = interaction.options.getString(syntaxLocale.commands.pidtune.options.heater.name)

        if (functionCache.current_status !== 'ready') {
            await interaction.reply(locale.messages.errors.command_idle_only
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        await interaction.reply(locale.messages.answers.pidtune_start
            .replace(/(\${heater})/g, heater)
            .replace(/(\${temp})/g, temp)
            .replace(/(\${username})/g, interaction.user.tag))

        const gcodeResponse = await moonrakerClient.send({
            "method": "printer.gcode.script",
            "params": {"script": `PID_CALIBRATE HEATER=${heater} TARGET=${temp}`}
        }, Number.POSITIVE_INFINITY)

        if (typeof gcodeResponse.error !== 'undefined') {
            await interaction.editReply(locale.messages.errors.pidtune_fail
                .replace(/(\${heater})/g, heater)
                .replace(/(\${reason})/g, gcodeResponse.error.message)
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        await interaction.editReply(locale.messages.answers.pidtune_done
            .replace(/(\${heater})/g, heater)
            .replace(/(\${username})/g, interaction.user.tag))
    }
}