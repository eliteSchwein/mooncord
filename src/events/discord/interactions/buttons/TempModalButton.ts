import {ButtonInteraction, Message} from "discord.js";
import {findValue, getEntry} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {TemplateHelper} from "../../../../helper/TemplateHelper";

export class TempModalButton {
    protected modalHelper = new ModalHelper()
    protected embedHelper = new EmbedHelper()
    protected templateHelper = new TemplateHelper()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping.show_temp_modal === 'undefined') { return }

        const rawEmbedTemplate = this.templateHelper.parseRawTemplate('embed', 'single_temperature')
        const rawTitle = rawEmbedTemplate.title.replace(/(\${.*})/g, 'PLACEHOLDER').split('PLACEHOLDER')
        const currentMessage = interaction.message as Message
        let tempSensor = currentMessage.embeds[0].title

        for (const rawTitlePartial of rawTitle) {
            tempSensor = tempSensor.replace(rawTitlePartial, '')
        }

        const sensorTarget = getEntry('state')[tempSensor].target

        const modal = await this.modalHelper.generateModal('temp_target', {'heater': tempSensor, 'target_temp': sensorTarget})

        if(buttonData.function_mapping.modal_delete_message) {
            await currentMessage.delete()
        }

        await interaction.showModal(modal)
    }
}