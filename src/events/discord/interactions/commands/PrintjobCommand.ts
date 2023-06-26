'use strict'

import {CommandInteraction, MessageEmbed} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {getEntry} from "../../../../utils/CacheUtil";
import {logNotice} from "../../../../helper/LoggerHelper";
import {getMoonrakerClient} from "../../../../Application";
import {formatTime} from "../../../../helper/DataHelper";

export class PrintjobCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'printjob') {
            return
        }

        void this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const subCommand = interaction.options.getSubcommand()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const syntaxLocale = localeHelper.getSyntaxLocale()

        switch (subCommand) {
            case syntaxLocale.commands.printjob.options.pause.name: {
                await this.triggerMacro('printjob_pause', interaction, locale.messages.answers.printjob_pause, 'pause')
                break
            }
            case syntaxLocale.commands.printjob.options.cancel.name: {
                await this.triggerMacro('printjob_cancel', interaction, locale.messages.answers.printjob_cancel)
                break
            }
            case syntaxLocale.commands.printjob.options.resume.name: {
                await this.triggerMacro('printjob_resume', interaction, locale.messages.answers.printjob_resume, 'printing')
                break
            }
            case syntaxLocale.commands.printjob.options.start.name: {
                await this.requestPrintjob(interaction.options.getString(
                    syntaxLocale.commands.printjob.options.start.options.file.name
                ), interaction)
                break
            }
        }
    }

    private async requestPrintjob(printFile: string, interaction: CommandInteraction) {
        await interaction.deferReply()

        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const metadataHelper = new MetadataHelper()
        const embedHelper = new EmbedHelper()

        if (!printFile.endsWith('.gcode')) {
            printFile = `${printFile}.gcode`
        }

        const metadata = await metadataHelper.getMetaData(printFile)

        if (typeof metadata === 'undefined') {
            await interaction.editReply(locale.messages.errors.file_not_found)
            return
        }

        const thumbnail = await metadataHelper.getThumbnail(printFile)

        metadata.estimated_time = formatTime(metadata.estimated_time)
        metadata.filename = printFile

        const embedData = await embedHelper.generateEmbed('printjob_start_request', metadata)
        const embed = embedData.embed.embeds[0] as MessageEmbed

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

            await interaction.reply(message)
            return
        }

        if (!requiredStates.includes(functionCache.current_status)) {
            const message = subLocale.status_not_valid
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.reply(message)
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

        await interaction.reply(message)
    }
}