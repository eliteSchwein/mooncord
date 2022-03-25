import {CommandInteraction, MessageAttachment} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {getEntry} from "../../../../utils/CacheUtil";

export class TuneCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected locale = this.localeHelper.getLocale()
    protected functionCache = getEntry('function')
    protected moonrakerClient = getMoonrakerClient()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'tune') { return }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const speed = interaction.options.getInteger(this.syntaxLocale.commands.tune.options.speed.name)
        const flow = interaction.options.getInteger(this.syntaxLocale.commands.tune.options.flow.name)
        let message = ''

        if(this.functionCache.current_status !== 'printing') {
            const message = this.locale.messages.printjob_cancel.status_not_valid
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.reply(message)
            return
        }

        await interaction.deferReply()

        if(speed === null && flow === null) {
            await interaction.editReply(this.locale.messages.errors.missing_arguments
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        if(speed !== null) {
            await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `M220 S${speed}`}})
            message = 'speed'
        }

        if(flow !== null) {
            await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `M221 S${flow}`}})
            message = 'flow'
        }

        if(flow !== null && speed !== null) {
            message = 'speed_flow'
        }

        await interaction.editReply(this.locale.messages.answers.tune[message]
            .replace(/(\${username})/g, interaction.user.tag)
            .replace(/(\${speed})/g, speed)
            .replace(/(\${flow})/g, flow))
    }
}