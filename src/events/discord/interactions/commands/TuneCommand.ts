import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";

export default class TuneCommand extends BaseCommand {
    commandId = 'tune'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const functionCache = getEntry('function')
        const speed = interaction.options.getInteger(this.syntaxLocale.commands.tune.options.speed.name)
        const flow = interaction.options.getInteger(this.syntaxLocale.commands.tune.options.flow.name)
        let message = ''

        if (functionCache.current_status !== 'printing') {
            const message = this.locale.messages.answers.printjob_pause.status_not_valid
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.reply(message)
            return
        }

        await interaction.deferReply()

        if (speed === null && flow === null) {
            await interaction.editReply(this.locale.messages.errors.missing_arguments
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        if (speed !== null) {
            await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `M220 S${speed}`}})
            message = 'speed'
        }

        if (flow !== null) {
            await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `M221 S${flow}`}})
            message = 'flow'
        }

        if (flow !== null && speed !== null) {
            message = 'speed_flow'
        }

        await interaction.editReply(this.locale.messages.answers.tune[message]
            .replace(/(\${username})/g, interaction.user.tag)
            .replace(/(\${speed})/g, speed)
            .replace(/(\${flow})/g, flow))
    }
}