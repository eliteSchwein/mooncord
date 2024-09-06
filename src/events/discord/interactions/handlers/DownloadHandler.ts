import {Message, MessageAttachment, User} from "discord.js";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {downloadFile} from "../../../../helper/DataHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import util from "util";
import {logError} from "../../../../helper/LoggerHelper";

export default class DownloadHandler {
    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("download")) {
            return
        }
        if(message.embeds.length === 0) {
            return
        }
        if (typeof data.root_path === 'undefined') {
            return
        }

        if (interaction !== null && !interaction.replied && !interaction.deferred) {
            await interaction.deferReply({ephemeral: true})
        }

        const embedHelper = new EmbedHelper()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()

        const fileName = embedHelper.getAuthorName(message.embeds[0])
        const rootPath = data.root_path

        const result = await downloadFile(rootPath, fileName)

        if (result.overSizeLimit) {
            await interaction.editReply(locale.messages.errors.file_too_large
                .replace(/(\${filename})/g, `\`\`js\n${fileName}\`\``));
            return
        }

        const attachment = new MessageAttachment(result.data, fileName)

        await interaction.editReply({files: [attachment]});
    }
}