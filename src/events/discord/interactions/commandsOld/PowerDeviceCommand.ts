'use strict'

import {CommandInteraction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PowerDeviceHelper} from "../../../../helper/PowerDeviceHelper";

export class PowerDeviceCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'power') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const localeHelper = new LocaleHelper()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const locale = localeHelper.getLocale()
        const powerDevice = interaction.options.getString(syntaxLocale.commands.power.options.device.name)
        const powerDeviceData = new PowerDeviceHelper().getPowerDeviceData(powerDevice)

        if (powerDevice === null || powerDeviceData === null) {
            await interaction.reply(locale.messages.errors.no_power_device
                .replace(/(\${username})/g, interaction.user.tag))
        }

        await interaction.deferReply()

        const newState = (powerDeviceData.status === 'on') ? 'off' : 'on'

        await getMoonrakerClient().send({
            'method': 'machine.device_power.post_device',
            'params': {'device': powerDevice, 'action': newState}
        })

        let newStatusMessage = (powerDeviceData.status === 'on') ?
            locale.messages.answers.power_device.off :
            locale.messages.answers.power_device.on

        newStatusMessage = newStatusMessage
            .replace(/(\${username})/g, interaction.user.username)
            .replace(/(\${power_device})/g, powerDevice)

        await interaction.editReply(newStatusMessage)
    }
}