'use strict'

import {CommandInteraction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PowerDeviceHelper} from "../../../../helper/PowerDeviceHelper";

export class PowerDeviceCommand {
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected locale = this.localeHelper.getLocale()
    protected moonrakerClient = getMoonrakerClient()
    protected powerDeviceHelper = new PowerDeviceHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'power') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const powerDevice = interaction.options.getString(this.syntaxLocale.commands.power.options.device.name)
        const powerDeviceData = this.powerDeviceHelper.getPowerDeviceData(powerDevice)

        if (powerDevice === null || powerDeviceData === null) {
            await interaction.reply(this.localeHelper.getCommandNotReadyError(interaction.user.username))
        }

        await interaction.deferReply()

        const newState = (powerDeviceData.status === 'on') ? 'off' : 'on'

        await this.moonrakerClient.send({
            'method': 'machine.device_power.post_device',
            'params': {'device': powerDevice, 'action': newState}
        })

        let newStatusMessage = (powerDeviceData.status === 'on') ?
            this.locale.messages.answers.power_device.off :
            this.locale.messages.answers.power_device.on

        newStatusMessage = newStatusMessage
            .replace(/(\${username})/g, interaction.user.username)
            .replace(/(\${power_device})/g, powerDevice)

        await interaction.editReply(newStatusMessage)
    }
}