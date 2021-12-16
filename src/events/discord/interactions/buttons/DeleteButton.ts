import {ButtonInteraction} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class DeleteButton {
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if (!buttonData.function_mapping.delete) { return }
        if(typeof buttonData.function_mapping.root_path === 'undefined') { return }

        const currentEmbed = interaction.message.embeds[0]

        if(currentEmbed.author === null) {
            return
        }

        if(!interaction.replied &&
            !interaction.deferred) {
            await interaction.deferReply()
        }

        const rootPath = buttonData.function_mapping.root_path
        const filename = currentEmbed.author.name

        const feedback = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "server.files.delete_file", "params": {"path":"${rootPath}/${filename}"}}`)

        if(typeof feedback.error !== 'undefined') {
            await interaction.editReply(this.locale.messages.errors.file_not_found)
            return
        }

        const answer = this.locale.messages.answers.file_deleted
            .replace(/(\${root})/g, rootPath)
            .replace(/(\${filename})/g, filename)

        await interaction.editReply(answer)
    }
}