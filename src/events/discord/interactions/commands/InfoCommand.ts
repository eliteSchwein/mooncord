import {CommandInteraction, Interaction} from "discord.js";

export class InfoCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'info') { return }
    }
}