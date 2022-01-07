import {ButtonInteraction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";

export class UpdateButton {
    protected moonrakerClient = getMoonrakerClient()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(!buttonData.function_mapping.update_system) { return }

        await this.moonrakerClient.send({'method': 'machine.update.full'}, Number.POSITIVE_INFINITY)
    }
}