import {AttachmentBuilder, Message, MessageFlagsBitField, User} from "discord.js";
import BaseHandler from "../abstracts/BaseHandler";
import {downloadFile} from "../../../../utils/FileUtil";

export default class DownloadHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("download")) {
            return false
        }
        if (message.embeds.length === 0) {
            return false
        }
        if (typeof data.root_path === 'undefined') {
            return false
        }
        return true
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        if (interaction !== null && !interaction.replied && !interaction.deferred) {
            await interaction.deferReply({flags: MessageFlagsBitField.Flags.Ephemeral})
        }

        const fileName = this.embedHelper.getAuthorName(message.embeds[0])
        const rootPath = data.root_path

        const result = await downloadFile(rootPath, fileName)

        if (result.overSizeLimit) {
            await interaction.editReply(this.locale.messages.errors.file_too_large
                .replace(/(\${filename})/g, `\`\`js\n${fileName}\`\``));
            return
        }

        const attachment = new AttachmentBuilder(result.data, {name: fileName})

        await interaction.editReply({files: [attachment]});
    }
}