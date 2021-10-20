import {Interaction} from "discord.js";
import {InfoCommand} from "./commands/InfoCommand";
import {DiscordCommandGenerator} from "../../../generator/DiscordCommandGenerator";
import { DumpCommand } from "./commands/DumpCommand";
import { logNotice } from "../../../helper/ConsoleLogger";

export class CommandInteraction {
    protected commandGenerator = new DiscordCommandGenerator()
    public constructor(interaction: Interaction) {
        if(!interaction.isCommand()) { return }

        const commandId = this.commandGenerator.getCommandId(interaction.commandName)

        if(typeof commandId === 'undefined') { return }

        logNotice(`${interaction.user.tag} executed command: ${commandId}`)

        new InfoCommand(interaction, commandId)
        new DumpCommand(interaction, commandId)
    }
}