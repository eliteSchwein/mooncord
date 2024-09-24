import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {findValue, getEntry} from "../../../../utils/CacheUtil";
import {TempHelper} from "../../../../helper/TempHelper";
import {getMoonrakerClient} from "../../../../Application";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {logRegular} from "../../../../helper/LoggerHelper";

export default class PreheatCommand extends BaseCommand {
    commandId = 'preheat'
    defer = false

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand()
        const functionCache = getEntry('function')

        if (functionCache.current_status !== 'ready') {
            await interaction.reply(this.locale.messages.errors.command_idle_only
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        switch (subCommand) {
            case this.syntaxLocale.commands.preheat.options.preset.name: {
                const preset = interaction.options.getString(this.syntaxLocale.commands.preheat.options.preset.options.preset.name)
                await this.heatProfile(preset)

                await interaction.reply(this.locale.messages.answers.preheat_preset.preset
                    .replace(/(\${preset})/g, preset)
                    .replace(/(\${username})/g, interaction.user.tag))
                break
            }
            case this.syntaxLocale.commands.preheat.options.manual.name: {
                await this.heatManual(interaction)
                break
            }
        }
    }

    private async heatManual(interaction: ChatInputCommandInteraction) {
        const availableHeaters = findValue('state.heaters.available_heaters')
        const tempHelper = new TempHelper()

        let argumentFound = false
        let heaterList = ''

        for (const heater of availableHeaters) {
            const heaterName = heater.replace(/(heater_generic )/g, '')
            const heaterTemp = interaction.options.getInteger(heaterName)
            const heaterData = tempHelper.getHeaterConfigData(heater)
            const heaterMaxTemp = Number(heaterData.max_temp)
            const heaterMinTemp = Number(heaterData.min_temp)

            if (heaterTemp === null) {
                continue
            }

            if (heaterTemp > heaterMaxTemp) {
                await interaction.reply(this.locale.messages.errors.preheat_over_max
                    .replace(/(\${max_temp})/g, heaterMaxTemp)
                    .replace(/(\${temp})/g, heaterTemp)
                    .replace(/(\${username})/g, interaction.user.tag))
                return
            }

            if (heaterTemp < heaterMinTemp) {
                await interaction.reply(this.locale.messages.errors.preheat_below_min
                    .replace(/(\${min_temp})/g, heaterMinTemp)
                    .replace(/(\${temp})/g, heaterTemp)
                    .replace(/(\${username})/g, interaction.user.tag))
                return
            }

            argumentFound = true
            heaterList = `\`${heater}: ${heaterTemp}C°\`, ${heaterList}`
            await tempHelper.heatHeater(heaterName, heaterTemp)
        }

        if (!argumentFound) {
            const modal = await this.modalHelper.generateModal('temp_target')
            await interaction.showModal(modal)
            return
        }

        heaterList = heaterList.slice(0, Math.max(0, heaterList.length - 2))

        await interaction.reply(this.locale.messages.answers.preheat_preset.manual
            .replace(/(\${heater_list})/g, heaterList)
            .replace(/(\${username})/g, interaction.user.tag))
    }

    private async heatProfile(profileName: string) {
        const moonrakerClient = getMoonrakerClient()
        const tempHelper = new TempHelper()
        const preset = new ConfigHelper().getEntriesByFilter(new RegExp(`^preset ${profileName}$`, "g"), false)[0]

        if(preset.gcode) {
            logRegular(`execute ${preset.gcode}...`)
            await moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": preset.gcode}})
        }

        delete preset.gcode

        for (const heater in preset) {
            const heaterTemp = preset[heater]
            await tempHelper.heatHeater(heater, heaterTemp)
        }
    }
}