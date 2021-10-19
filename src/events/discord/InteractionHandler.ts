import {Client} from "discord.js";
import {updateData} from "../../utils/CacheUtil";
import {getDiscordClient} from "../../Application";
import {ButtonInteraction} from "./interactions/ButtonInteraction";
import {CommandInteraction} from "./interactions/CommandInteraction";
import {SelectInteraction} from "./interactions/SelectInteraction";

export class InteractionHandler {
    public constructor(discordClient: Client) {
        discordClient.on('interactionCreate', async interaction => {
            if(interaction.applicationId !== discordClient.application.id) { return }
            new ButtonInteraction(interaction);
            new CommandInteraction(interaction);
            new SelectInteraction(interaction);
        })
    }
}