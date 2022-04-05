import type { Message, SelectMenuInteraction} from "discord.js";
import {ButtonInteraction, MessageEmbed} from "discord.js";

import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {findValueByPartial, formatTime} from "../../../../helper/DataHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logNotice} from "../../../../helper/LoggerHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {findValue, getEntry, getMeshOptions} from "../../../../utils/CacheUtil";
import {GraphHelper} from "../../../../helper/GraphHelper";

export class ShowMeshSelection {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected graphHelper = new GraphHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected metadataHelper = new MetadataHelper()
    protected functionCache = getEntry('function')

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if(selectionId !== 'show_mesh') { return }

        void this.execute(interaction)
    }

    protected async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()

        if(!this.configHelper.isGraphEnabled()) {
            const message = this.locale.messages.errors.command_disabled
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.editReply(message)
            return
        }

        if(!this.configHelper.isGraphEnabledWhilePrinting() && this.functionCache.current_status === 'printing') {
            const message = this.locale.messages.errors.not_ready
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.editReply(message)
            return
        }

        const meshCache = findValue('state.bed_mesh')
        const meshValue = interaction.values[0]
        
        let meshOptions = getMeshOptions()
        let mesh = meshCache[meshValue]
        
        if(this.configHelper.isButtonSyntaxLocale()) {
            meshOptions = [...meshOptions, ...this.syntaxLocale.selections.show_mesh.options]
        } else {
            meshOptions = [...meshOptions, ...this.locale.selections.show_mesh.options]
        }

        const meshOption = meshOptions.find(o => o.value === meshValue)
        const meshView = meshOption.name

        if(typeof mesh === 'undefined') {
            mesh = meshCache.profiles[meshValue].points
        }

        const embedData = await this.embedHelper.generateEmbed('mesh_view',{'mesh_view': meshView})
        const meshPicture = await this.graphHelper.getMeshGraph(mesh)
        const embed = embedData.embed.embeds[0] as MessageEmbed
        const components = embedData.embed['components']
        let files = []

        if(typeof embedData.embed['files'] !== 'undefined') {
            files = [...files, ...embedData.embed['files']]
        }

        embed.setImage(`attachment://${meshPicture.name}`)
        files.push(meshPicture)

        const currentMessage = interaction.message as Message

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit({embeds: [embed], files, components})

        await interaction.deleteReply()
    }
}