import {Interaction} from "discord.js";
import {InfoCommand} from "./commands/InfoCommand";
import {DiscordCommandGenerator} from "../../../generator/DiscordCommandGenerator";
import { DumpCommand } from "./commands/DumpCommand";
import {logNotice, logWarn} from "../../../helper/ConsoleLogger";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";

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

        const commandId = this.commandGenerator.getCommandId(interaction.commandName)

        if(typeof commandId === 'undefined') { return }

        logNotice(`${interaction.user.tag} executed command: ${commandId}`)

        if(!this.permissionHelper.hasPermission(interaction.user, interaction.guild, commandId)) {
            await interaction.reply({
                content: this.localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: this.config.showNoPermissionPrivate() })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${commandId}`)
            return;
        }

        void new InfoCommand(interaction, commandId)
        void new DumpCommand(interaction, commandId)
    }
}