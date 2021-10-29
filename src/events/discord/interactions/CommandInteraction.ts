import {Interaction} from "discord.js";
import {InfoCommand} from "./commands/InfoCommand";
import {DiscordCommandGenerator} from "../../../generator/DiscordCommandGenerator";
import { DumpCommand } from "./commands/DumpCommand";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import { TempCommand } from "./commands/TempCommand";
import { sleep } from "../../../helper/FormattingHelper";
import { RestartCommand } from "./commands/RestartCommand";
import { GetLodCommand } from "./commands/GetLogCommand";
import {UserIdCommand} from "./commands/UserIdCommand";
import {ResetDatabaseCommand} from "./commands/ResetDatabaseCommand";
import {NotifyCommand} from "./commands/NotifyCommand";
import {EmergencyStopCommand} from "./commands/EmergencyStopCommand";

export class CommandInteraction {
    protected config = new ConfigHelper()
    protected commandGenerator = new DiscordCommandGenerator()
    protected localeHelper = new LocaleHelper()
    protected permissionHelper = new PermissionHelper()
    
    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }
    protected async execute(interaction: Interaction) {
        if(!interaction.isCommand()) { return }

        let logFeedback = interaction.commandName

        for(const option of interaction.options['_hoistedOptions']) {
            logFeedback = `${logFeedback} ${option.name}:${option.value}`
        }

        const commandId = this.commandGenerator.getCommandId(interaction.commandName)

        if(typeof commandId === 'undefined') { return }

        logNotice(`${interaction.user.tag} executed command: ${logFeedback}`)

        if(!this.permissionHelper.hasPermission(interaction.user, interaction.guild, commandId)) {
            await interaction.reply({
                content: this.localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: this.config.showNoPermissionPrivate() })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${interaction.commandName} (${commandId})`)
            return;
        }

        void new InfoCommand(interaction, commandId)
        void new DumpCommand(interaction, commandId)
        void new TempCommand(interaction, commandId)
        void new RestartCommand(interaction, commandId)
        void new GetLodCommand(interaction, commandId)
        void new UserIdCommand(interaction, commandId)
        void new ResetDatabaseCommand(interaction, commandId)
        void new NotifyCommand(interaction, commandId)
        void new EmergencyStopCommand(interaction, commandId)

        await sleep(1500)

        if(interaction.replied || interaction.deferred) { return }

        await interaction.reply(this.localeHelper.getCommandNotReadyError(interaction.user.tag))
    }
}