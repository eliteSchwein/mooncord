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

        const modeArgument = interaction.options.getString(this.syntaxLocale.commands.mesh.options.mode.name)
        const profileArgument = interaction.options.getString(this.syntaxLocale.commands.mesh.options.profile.name)
        const meshCache = findValue('state.bed_mesh')

        let mesh = []
        let profile = 'default'
        let meshView = ''

        if(profileArgument !== null) {
            profile = profileArgument
        }

        if(modeArgument !== null) {
            mesh = meshCache[modeArgument]
            meshView = modeArgument
        } else {
            mesh = meshCache.profiles[profile].points
            meshView = profile
        }

        const embedData = await this.embedHelper.generateEmbed('mesh_view',{'mesh_view': meshView})
        const files = embedData.embed['files'] as [MessageAttachment]
        const meshPicture = await this.graphHelper.getMeshGraph(mesh)
        const embed = embedData.embed.embeds[0] as MessageEmbed

        embed.setImage(`attachment://${meshPicture.name}`)
        files.push(meshPicture)

        await interaction.editReply({embeds: [embed], files})
    }
}