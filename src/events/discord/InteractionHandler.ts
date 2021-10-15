import {Client} from "discord.js";
import {updateData} from "../../utils/CacheUtil";
import {getDiscordClient} from "../../Application";

export class InteractionHandler {
    public constructor(discordClient: Client) {
        discordClient.on('interactionCreate', async interaction => {
            if(interaction.applicationId !== discordClient.application.id) { return }
            console.log(discordClient)
        })
    }
}