import {Interaction} from "discord.js";

export class InfoCommand {
    public constructor(interaction: Interaction, commandId: string) {
        if(commandId !== 'status') { return }
    }
}