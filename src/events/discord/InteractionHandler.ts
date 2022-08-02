import {Client} from "discord.js";
import {ButtonInteraction} from "./interactions/ButtonInteraction";
import {CommandInteraction} from "./interactions/CommandInteraction";
import {SelectInteraction} from "./interactions/SelectInteraction";
import {ModalInteraction} from "./interactions/ModalInteraction";

export class InteractionHandler {
    public constructor(discordClient: Client) {
        discordClient.on('interactionCreate', async interaction => {
            if(interaction.applicationId !== discordClient.application.id) { return }
            new ButtonInteraction(interaction);
            new CommandInteraction(interaction);
            new SelectInteraction(interaction);
            new ModalInteraction(interaction)
        })
    }
}