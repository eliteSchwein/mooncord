import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {MCUHelper} from "../../../../helper/MCUHelper";

export default class SystemInfoCommand extends BaseCommand {
    commandId = 'systeminfo';

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const componentArgument = interaction.options.getString(this.syntaxLocale.commands.systeminfo.options.component.name)

        let embed: any

        if(componentArgument !== null) {
            if (componentArgument.startsWith('mcu')) {
                const mcuHelper = new MCUHelper()

                const mcuData = mcuHelper.getMCULoad(componentArgument)
                embed = await this.embedHelper.generateEmbed(`systeminfo_mcu`, mcuData)
            } else {
                embed = await this.embedHelper.generateEmbed(`systeminfo_${componentArgument}`)
            }
        } else {
            embed = await this.embedHelper.generateEmbed('systeminfo_cpu')
        }

        await interaction.editReply(embed.embed)
    }
}