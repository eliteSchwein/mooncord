import {ButtonInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {getMoonrakerClient} from "../../../../Application";

export class ExcludeConfirmButton {
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping.exclude_object === 'undefined') { return }

        if(!interaction.deferred && !interaction.replied) {
            await interaction.deferReply()
        }

        const objectOptions = interaction.message.components[0].components[0]['options']
        let object = undefined

        for(const objectOption of objectOptions) {
            if(objectOption.default) {
                object = objectOption.value
            }
        }

        await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": `EXCLUDE_OBJECT NAME=${object}`}}, Number.POSITIVE_INFINITY)

        const answer = this.locale.messages.answers.excluded_object
            .replace(/(\${object})/g, object)
            .replace(/(\${username})/g, interaction.user.username)

        if(!interaction.replied) {
            await interaction.editReply(answer)
        } else {
            await interaction.followUp(answer)
        }

    }
}