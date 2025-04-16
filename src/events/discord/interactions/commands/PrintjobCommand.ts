import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction, CommandInteraction, EmbedBuilder} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getMoonrakerClient} from "../../../../Application";
import {logNotice} from "../../../../helper/LoggerHelper";

export default class PrintjobCommand extends BaseCommand {
    commandId = 'printjob'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand()

        switch (subCommand) {
            case this.syntaxLocale.commands.printjob.options.pause.name: {
                await this.triggerMacro('printjob_pause', interaction, this.locale.messages.answers.printjob_pause, 'pause')
                break
            }
            case this.syntaxLocale.commands.printjob.options.cancel.name: {
                await this.triggerMacro('printjob_cancel', interaction, this.locale.messages.answers.printjob_cancel)
                break
            }
            case this.syntaxLocale.commands.printjob.options.resume.name: {
                await this.triggerMacro('printjob_resume', interaction, this.locale.messages.answers.printjob_resume, 'printing')
                break
            }
            case this.syntaxLocale.commands.printjob.options.start.name: {
                await this.requestPrintjob(interaction.options.getString(
                    this.syntaxLocale.commands.printjob.options.start.options.file.name
                ), interaction)
                break
            }
        }
    }

    private async requestPrintjob(printFile: string, interaction: CommandInteraction) {
        if (!printFile.endsWith('.gcode')) {
            printFile = `${printFile}.gcode`
        }

        const metadata = await this.metadataHelper.getMetaData(printFile)

        if (typeof metadata === 'undefined') {
            await interaction.editReply(this.locale.messages.errors.file_not_found)
            return
        }

        const thumbnail = await this.metadataHelper.getThumbnail(printFile)

        metadata.filename = printFile

        const embedData = await this.embedHelper.generateEmbed('printjob_start_request', metadata)
        const embed = embedData.embed.embeds[0] as EmbedBuilder

        embed.setThumbnail(`attachment://${thumbnail.name}`)

        embedData.embed.embeds = [embed]
        embedData.embed['files'] = [thumbnail]

        await interaction.editReply(embedData.embed)
    }

    private async triggerMacro(buttonId: string, interaction: CommandInteraction, subLocale, status = '') {
        const buttonsCache = getEntry('buttons')
        const buttonData = buttonsCache[buttonId]
        const moonrakerClient = getMoonrakerClient()
        const functionCache = getEntry('function')

        if (typeof buttonData.macros === 'undefined') {
            return
        }
        if (buttonData.macros.empty) {
            return
        }
        if (typeof buttonData.required_states === 'undefined') {
            return
        }

        const requiredStates = buttonData.required_states

        if (status === functionCache.current_status) {
            const message = subLocale.status_same
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.editReply(message)
            return
        }

        if (!requiredStates.includes(functionCache.current_status)) {
            const message = subLocale.status_not_valid
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.editReply(message)
            return
        }

        for (const macro of buttonData.macros) {
            logNotice(`executing macro: ${macro}`)
            void moonrakerClient.send({
                "method": "printer.gcode.script",
                "params": {"script": macro}
            }, Number.POSITIVE_INFINITY)
        }

        const message = subLocale.status_valid
            .replace(/(\${username})/g, interaction.user.tag)

        await interaction.editReply(message)
    }
}