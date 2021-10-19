import {Interaction} from "discord.js";

export class ButtonInteraction {
    public constructor(interaction: Interaction) {
        if(!interaction.isButton()) { return }
    }
}