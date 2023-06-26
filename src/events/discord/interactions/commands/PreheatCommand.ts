'use strict'

import {CommandInteraction} from "discord.js";
import {findValue, getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logRegular} from "../../../../helper/LoggerHelper";
import {TempHelper} from "../../../../helper/TempHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";

export class PreheatCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'preheat') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const subCommand = interaction.options.getSubcommand()
        const localeHelper = new LocaleHelper()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const locale = localeHelper.getLocale()
        const functionCache = getEntry('function')

        if (functionCache.current_status !== 'ready') {
            await interaction.reply(locale.messages.errors.command_idle_only
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        switch (subCommand) {
            case syntaxLocale.commands.preheat.options.preset.name: {
                const preset = interaction.options.getString(syntaxLocale.commands.preheat.options.preset.options.preset.name)
                await this.heatProfile(preset)

                await interaction.reply(locale.messages.answers.preheat_preset.preset
                    .replace(/(\${preset})/g, preset)
                    .replace(/(\${username})/g, interaction.user.tag))
                break
            }
            case syntaxLocale.commands.preheat.options.manual.name: {
                await this.heatManual(interaction)
                break
            }
        }
    }

    private async heatManual(interaction: CommandInteraction) {
        const availableHeaters = findValue('state.heaters.available_heaters')
        const tempHelper = new TempHelper()
        const localeHelper = new LocaleHelper()
        const modalHelper = new ModalHelper()
        const locale = localeHelper.getLocale()

        let argumentFound = false
        let heaterList = ''

        for (const heater of availableHeaters) {
            const heaterTemp = interaction.options.getInteger(heater)
            const heaterData = tempHelper.getHeaterConfigData(heater)
            const heaterMaxTemp = Number(heaterData.max_temp)
            const heaterMinTemp = Number(heaterData.min_temp)

            if (heaterTemp === null) {
                continue
            }

            if (heaterTemp > heaterMaxTemp) {
                await interaction.reply(locale.messages.errors.preheat_over_max
                    .replace(/(\${max_temp})/g, heaterMaxTemp)
                    .replace(/(\${temp})/g, heaterTemp)
                    .replace(/(\${username})/g, interaction.user.tag))
                return
            }

            if (heaterTemp < heaterMinTemp) {
                await interaction.reply(locale.messages.errors.preheat_below_min
                    .replace(/(\${min_temp})/g, heaterMinTemp)
                    .replace(/(\${temp})/g, heaterTemp)
                    .replace(/(\${username})/g, interaction.user.tag))
                return
            }

            argumentFound = true
            heaterList = `\`${heater}: ${heaterTemp}C°\`, ${heaterList}`
            await tempHelper.heatHeater(heater, heaterTemp)
        }

        if (!argumentFound) {
            const modal = await modalHelper.generateModal('temp_target')
            await interaction.showModal(modal)
            return
        }

        heaterList = heaterList.slice(0, Math.max(0, heaterList.length - 2))

        await interaction.reply(locale.messages.answers.preheat_preset.manual
            .replace(/(\${heater_list})/g, heaterList)
            .replace(/(\${username})/g, interaction.user.tag))
    }

    private async heatProfile(profileName: string) {
        const moonrakerClient = getMoonrakerClient()
        const tempHelper = new TempHelper()
        const preset = Object.assign({}, findValue(`config.presets.${profileName}`))

        for (const gcode in preset.gcode) {
            logRegular(`execute ${gcode}...`)
            await moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": gcode}})
        }

        delete preset.gcode

        for (const heater in preset) {
            const heaterTemp = preset[heater]
            await tempHelper.heatHeater(heater, heaterTemp)
        }
    }
}