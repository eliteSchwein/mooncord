import {Message, User} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {getMoonrakerClient} from "../../../../Application";

export class PrintJobStartHandler {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected metadataHelper = new MetadataHelper()
    protected embedHelper = new EmbedHelper()
    protected moonrakerClient = getMoonrakerClient()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("start_print")) {
            return
        }

        const embed = message.embeds[0]

        const printFile = this.embedHelper.getAuthorName(embed)

        const metadata = await this.metadataHelper.getMetaData(printFile)

        if (typeof metadata === 'undefined') {
            if (interaction !== null) {
                await interaction.editReply(this.locale.messages.errors.file_not_found)
            } else {
                await message.reply(this.locale.messages.errors.file_not_found)
            }
            return
        }

        await this.moonrakerClient.send({"method": "printer.print.start", "params": {"filename": printFile}})
    }
}