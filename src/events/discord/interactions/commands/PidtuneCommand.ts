import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";

export default class PidtuneCommand extends BaseCommand {
    commandId = 'pidtune'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const functionCache = getEntry('function')

        const temp = interaction.options.getInteger(this.syntaxLocale.commands.pidtune.options.temperature.name)
        const heater = interaction.options.getString(this.syntaxLocale.commands.pidtune.options.heater.name)

        if (functionCache.current_status !== 'ready') {
            await interaction.editReply(this.locale.messages.errors.command_idle_only
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        await interaction.editReply(this.locale.messages.answers.pidtune_start
            .replace(/(\${heater})/g, heater)
            .replace(/(\${temp})/g, temp)
            .replace(/(\${username})/g, interaction.user.tag))

        const gcodeResponse = await this.moonrakerClient.send({
            "method": "printer.gcode.script",
            "params": {"script": `PID_CALIBRATE HEATER=${heater} TARGET=${temp}`}
        }, Number.POSITIVE_INFINITY)

        if (typeof gcodeResponse.error !== 'undefined') {
            await interaction.editReply(this.locale.messages.errors.pidtune_fail
                .replace(/(\${heater})/g, heater)
                .replace(/(\${reason})/g, gcodeResponse.error.message)
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        await interaction.editReply(this.locale.messages.answers.pidtune_done
            .replace(/(\${heater})/g, heater)
            .replace(/(\${username})/g, interaction.user.tag))
    }
}