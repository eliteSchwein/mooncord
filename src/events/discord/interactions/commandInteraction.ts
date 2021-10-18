import {Interaction} from "discord.js";

export class CommandInteraction {
    public constructor(interaction: Interaction) {
        if(!interaction.isCommand()) { return }
    }
}