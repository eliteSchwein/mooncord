import BaseCommand from "./BaseCommand";
import {ChatInputCommandInteraction, User} from "discord.js";

export default class RestartCommand extends BaseCommand {
    commandId = 'restart'
    protected user: User

    async handleCommand(interaction: ChatInputCommandInteraction) {
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