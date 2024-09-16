'use strict'

import {CommandInteraction, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class RestartCommand {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected moonrakerClient = getMoonrakerClient()
    protected user: User

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'restart') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const service = interaction.options.getString(this.syntaxLocale.commands.restart.options.service.name)

        await interaction.deferReply()

        this.user = interaction.user

        let result

        switch (service) {
            case "FirmwareRestart": {
                result = await this.restartFirmware()
                break
            }
            case "Host": {
                result = await this.restartHost()
                break
            }
            default: {
                result = await this.restartService(service)
            }
        }

        await interaction.editReply(result)
    }

    private async restartService(service: string) {
        const result = await this.moonrakerClient.send({"method": "machine.services.restart", "params": {service}})

        if (typeof result.error !== 'undefined') {
            return this.locale.messages.errors.restart_failed
                .replace(/(\${service})/g, service)
                .replace(/(\${reason})/g, result.error.message)
                .replace(/(\${username})/g, this.user.tag)
        }
        return this.locale.messages.answers.restart_successful
            .replace(/(\${service})/g, service)
            .replace(/(\${username})/g, this.user.tag)
    }

    private async restartFirmware() {
        void await this.moonrakerClient.send({"method": "printer.firmware_restart"})

        return this.locale.messages.answers.firmware_restart_successful
            .replace(/(\${username})/g, this.user.tag)
    }

    private async restartHost() {
        void await this.moonrakerClient.send({"method": "machine.reboot"})

        return this.locale.messages.answers.firmware_restart_successful
            .replace(/(\${username})/g, this.user.tag)
    }
}