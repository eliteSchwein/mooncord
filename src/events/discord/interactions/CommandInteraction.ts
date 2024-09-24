'use strict'

import {Interaction} from "discord.js";
import {DiscordCommandGenerator} from "../../../generator/DiscordCommandGenerator";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {sleep} from "../../../helper/DataHelper";
import AdminCommand from "./commands/AdminCommand";
import {FileInfoCommand} from "./commands/FileInfoCommand";
import InfoCommand from "./commands/InfoCommand";
import DumpCommand from "./commands/DumpCommand";
import TempCommand from "./commands/TempCommand";
import RestartCommand from "./commands/RestartCommand";
import ListLogsCommand from "./commands/ListLogsCommand";
import UserIdCommand from "./commands/UserIdCommand";
import ResetDatabaseCommand from "./commands/ResetDatabaseCommand";
import NotifyCommand from "./commands/NotifyCommand";
import EmergencyStopCommand from "./commands/EmergencyStopCommand";
import StatusCommand from "./commands/StatusCommand";
import EditChannelCommand from "./commands/EditChannelCommand";
import GcodeListCommand from "./commands/GcodeListCommand";
import PrintjobCommand from "./commands/PrintjobCommand";
import SystemInfoCommand from "./commands/SystemInfoCommand";
import PreheatCommand from "./commands/PreheatCommand";
import PidtuneCommand from "./commands/PidtuneCommand";
import SaveConfigCommand from "./commands/SaveConfigCommand";
import TuneCommand from "./commands/TuneCommand";
import ConfigCommand from "./commands/ConfigCommand";
import ExecuteCommand from "./commands/ExecuteCommand";
import CustomCommand from "./commands/CustomCommand";
import PowerDeviceCommand from "./commands/PowerDeviceCommand";
import HistoryCommand from "./commands/HistoryCommand";
import TimelapseListCommand from "./commands/TimelapseListCommand";

export class CommandInteraction {

    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }

    private async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) {
            return
        }

        let logFeedback = interaction.commandName

        for (const option of interaction.options['_hoistedOptions']) {
            logFeedback = `${logFeedback} ${option.name}:${option.value}`
        }

        const config = new ConfigHelper()
        const commandGenerator = new DiscordCommandGenerator()
        const localeHelper = new LocaleHelper()
        const permissionHelper = new PermissionHelper()

        const commandId = commandGenerator.getCommandId(interaction.commandName)

        let permissionId = commandId

        if (commandGenerator.isCustomCommand(commandId)) {
            permissionId = 'custom_command'
        }

        if (typeof commandId === 'undefined') {
            return
        }

        logNotice(`${interaction.user.tag} executed command: ${logFeedback}`)

        if (!permissionHelper.hasPermission(interaction.user, interaction.guild, permissionId)) {
            await interaction.reply({
                content: localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: config.showNoPermissionPrivate()
            })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${interaction.commandName} (${commandId})`)
            return;
        }

        void new AdminCommand().executeCommand(interaction, commandId)
        void new FileInfoCommand().executeCommand(interaction, commandId)
        void new InfoCommand().executeCommand(interaction, commandId)
        void new DumpCommand().executeCommand(interaction, commandId)
        void new TempCommand().executeCommand(interaction, commandId)
        void new RestartCommand().executeCommand(interaction, commandId)
        void new ListLogsCommand().executeCommand(interaction, commandId)
        void new UserIdCommand().executeCommand(interaction, commandId)
        void new ResetDatabaseCommand().executeCommand(interaction, commandId)
        void new NotifyCommand().executeCommand(interaction, commandId)
        void new EmergencyStopCommand().executeCommand(interaction, commandId)
        void new StatusCommand().executeCommand(interaction, commandId)
        void new EditChannelCommand().executeCommand(interaction, commandId)
        void new GcodeListCommand().executeCommand(interaction, commandId)
        void new PrintjobCommand().executeCommand(interaction, commandId)
        void new SystemInfoCommand().executeCommand(interaction, commandId)
        void new PreheatCommand().executeCommand(interaction, commandId)
        void new PidtuneCommand().executeCommand(interaction, commandId)
        void new SaveConfigCommand().executeCommand(interaction, commandId)
        void new TuneCommand().executeCommand(interaction, commandId)
        void new ConfigCommand().executeCommand(interaction, commandId)
        void new ExecuteCommand().executeCommand(interaction, commandId)
        void new CustomCommand().executeCommand(interaction, commandId)
        void new PowerDeviceCommand().executeCommand(interaction, commandId)
        void new HistoryCommand().executeCommand(interaction, commandId)
        void new TimelapseListCommand().executeCommand(interaction, commandId)

        await sleep(1_000)

        if(!interaction.deferred && !interaction.replied && !interaction.isModalSubmit()) {
            await interaction.reply(localeHelper.getCommandNotReadyError(interaction.user.tag))
            return
        }

        await sleep(60_000)

        if (interaction.replied) {
            return
        }

        await interaction.editReply(localeHelper.getCommandNotReadyError(interaction.user.tag))
    }
}