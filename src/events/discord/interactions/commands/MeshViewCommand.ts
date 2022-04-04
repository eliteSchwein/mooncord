import {CommandInteraction, MessageAttachment, MessageEmbed} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {findValue} from "../../../../utils/CacheUtil";
import {GraphHelper} from "../../../../helper/GraphHelper";

export class MeshViewCommand {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected localeHelper = new LocaleHelper()
    protected graphHelper = new GraphHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'mesh') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        const meshCache = findValue('state.bed_mesh')

        if(typeof meshCache === 'undefined') {
            const message = this.locale.messages.errors.no_mesh_found
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.editReply(message)

            return
        }

        const mesh = meshCache['mesh_matrix']
        const meshView = 'Mesh Matrix'

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

        await interaction.editReply({embeds: [embed], files, components})
    }
}