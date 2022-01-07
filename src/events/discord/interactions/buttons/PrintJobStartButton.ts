import {ButtonInteraction, Message} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {getMoonrakerClient} from "../../../../Application";

export class PrintJobStartButton {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected metadataHelper = new MetadataHelper()
    protected embedHelper = new EmbedHelper()
    protected moonrakerClient = getMoonrakerClient()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(!buttonData.function_mapping.start_print) { return }

        const currentMessage = interaction.message as Message
        const embed = currentMessage.embeds[0]

        const printFile = this.embedHelper.getAuthorName(embed)

        const metadata = await this.metadataHelper.getMetaData(printFile)

        if(typeof metadata === 'undefined') {
            await interaction.editReply(this.locale.messages.errors.file_not_found)
            return
        }

        await this.moonrakerClient.send({"method": "printer.print.start", "params": {"filename": printFile}})
    }
}