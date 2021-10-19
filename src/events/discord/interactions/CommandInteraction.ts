import {Interaction} from "discord.js";
import {InfoCommand} from "./commands/InfoCommand";
import {DiscordCommandGenerator} from "../../../generator/DiscordCommandGenerator";

export class CommandInteraction {
    protected commandGenerator = new DiscordCommandGenerator()
    public constructor(interaction: Interaction) {
        if(!interaction.isCommand()) { return }

        const commandId = this.commandGenerator.getCommandId(interaction.commandName)

        if(typeof commandId === 'undefined') { return }

        new InfoCommand(interaction, commandId)
    }
}