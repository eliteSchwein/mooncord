import {Interaction} from "discord.js";

export class SelectInteraction {
    public constructor(interaction: Interaction) {
        if(!interaction.isSelectMenu()) { return }
    }
}