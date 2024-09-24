import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {PowerDeviceHelper} from "../../../../helper/PowerDeviceHelper";
import {getMoonrakerClient} from "../../../../Application";

export default class PowerDeviceCommand extends BaseCommand {
    commandId = 'power'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const powerDevice = interaction.options.getString(this.syntaxLocale.commands.power.options.device.name)
        const powerDeviceData = new PowerDeviceHelper().getPowerDeviceData(powerDevice)

        if (powerDevice === null || powerDeviceData === null) {
            await interaction.editReply(this.locale.messages.errors.no_power_device
                .replace(/(\${username})/g, interaction.user.tag))
        }

        const newState = (powerDeviceData.status === 'on') ? 'off' : 'on'

        await getMoonrakerClient().send({
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