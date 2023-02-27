import {CommandInteraction, MessageEmbed} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {getEntry} from "../../../../utils/CacheUtil";
import {logNotice} from "../../../../helper/LoggerHelper";
import {getMoonrakerClient} from "../../../../Application";
import {formatTime} from "../../../../helper/DataHelper";

export class PrintjobCommand {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected metadataHelper = new MetadataHelper()
    protected embedHelper = new EmbedHelper()
    protected buttonsCache = getEntry('buttons')
    protected moonrakerClient = getMoonrakerClient()
    protected functionCache = getEntry('function')

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'printjob') {
            return
        }

        void this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
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

    protected async requestPrintjob(printFile: string, interaction: CommandInteraction) {
        await interaction.deferReply()

        if (!printFile.endsWith('.gcode')) {
            printFile = `${printFile}.gcode`
        }

        const metadata = await this.metadataHelper.getMetaData(printFile)

        if (typeof metadata === 'undefined') {
            await interaction.editReply(this.locale.messages.errors.file_not_found)
            return
        }

        const thumbnail = await this.metadataHelper.getThumbnail(printFile)

        metadata.estimated_time = formatTime(metadata.estimated_time)
        metadata.filename = printFile

        const embedData = await this.embedHelper.generateEmbed('printjob_start_request', metadata)
        const embed = embedData.embed.embeds[0] as MessageEmbed

        embed.setThumbnail(`attachment://${thumbnail.name}`)

        embedData.embed.embeds = [embed]
        embedData.embed['files'] = [thumbnail]

        await interaction.editReply(embedData.embed)
    }

    protected async triggerMacro(buttonId: string, interaction: CommandInteraction, subLocale, status = '') {
        const buttonData = this.buttonsCache[buttonId]

        if (typeof buttonData.function_mapping.macros === 'undefined') {
            return
        }
        if (buttonData.function_mapping.macros.empty) {
            return
        }
        if (typeof buttonData.function_mapping.required_states === 'undefined') {
            return
        }

        const requiredStates = buttonData.function_mapping.required_states

        if (status === this.functionCache.current_status) {
            const message = subLocale.status_same
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.reply(message)
            return
        }

        if (!requiredStates.includes(this.functionCache.current_status)) {
            const message = subLocale.status_not_valid
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.reply(message)
            return
        }

        for (const macro of buttonData.function_mapping.macros) {
            logNotice(`executing macro: ${macro}`)
            void this.moonrakerClient.send({
                "method": "printer.gcode.script",
                "params": {"script": macro}
            }, Number.POSITIVE_INFINITY)
        }

        const message = subLocale.status_valid
            .replace(/(\${username})/g, interaction.user.tag)

        await interaction.reply(message)
    }
}