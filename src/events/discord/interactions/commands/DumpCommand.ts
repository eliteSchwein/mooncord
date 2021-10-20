import {CommandInteraction, Interaction, MessageAttachment} from "discord.js";
import { dump } from "../../../../utils/CacheUtil";
import * as path from "path";

export class DumpCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'dump') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        void await dump()

        const attachment = new MessageAttachment(path.resolve(__dirname, '../temp/dump.json'), 'dump.json')

        await interaction.reply({ files: [attachment], ephemeral: true })
    }
}