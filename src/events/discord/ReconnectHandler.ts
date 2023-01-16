import {Client} from "discord.js";

export class ReconnectHandler {
    public constructor(discordClient: Client) {
        discordClient.on("reconnecting", () => {
            console.log('recon')
        })
    }
}