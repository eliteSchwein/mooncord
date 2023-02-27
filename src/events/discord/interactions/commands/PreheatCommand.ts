import {CommandInteraction} from "discord.js";
import {findValue, getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logRegular} from "../../../../helper/LoggerHelper";
import {TempHelper} from "../../../../helper/TempHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";

export class PreheatCommand {
    protected modalHelper = new ModalHelper()
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected locale = this.localeHelper.getLocale()
    protected tempHelper = new TempHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected functionCache = getEntry('function')

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'preheat') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const subCommand = interaction.options.getSubcommand()

        if (this.functionCache.current_status !== 'ready') {
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

    protected async heatManual(interaction: CommandInteraction) {
        const availableHeaters = findValue('state.heaters.available_heaters')
        let argumentFound = false
        let heaterList = ''

        for (const heater of availableHeaters) {
            const heaterTemp = interaction.options.getInteger(heater)
            const heaterData = this.tempHelper.getHeaterConfigData(heater)
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
            await this.tempHelper.heatHeater(heater, heaterTemp)
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

    protected async heatProfile(profileName: string) {
        const preset = Object.assign({}, findValue(`config.presets.${profileName}`))

        for (const gcode in preset.gcode) {
            logRegular(`execute ${gcode}...`)
            await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": gcode}})
        }

        delete preset.gcode

        for (const heater in preset) {
            const heaterTemp = preset[heater]
            await this.tempHelper.heatHeater(heater, heaterTemp)
        }
    }
}