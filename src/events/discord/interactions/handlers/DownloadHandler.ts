import {Message, User} from "discord.js";

export default class DownloadHandler {
    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("download")) {
            return
        }
        if (typeof data.root_path === 'undefined') {
            return
        }
    }
}