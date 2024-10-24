import BaseSelection from "../abstracts/BaseSelection";
import {Message, StringSelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import _ from "lodash";
import HistoryGraph from "../../../../helper/graphs/HistoryGraph";

export class HistoryDetail extends BaseSelection {
    selectionId = 'history_detail_select'

    async handleSelection(interaction: StringSelectMenuInteraction) {
        const jobId = interaction.values[0]
        const jobs = getEntry('history').jobs.jobs
        const historyGraph = new HistoryGraph()
        const similarJobs = { }

        const job = _.find(jobs, { id: jobId })
        const gcodeFile = job.filename

        for(const jobPartial of jobs) {
            if(jobPartial.filename !== job.filename) continue
            if(!similarJobs[jobPartial.status]) {
                similarJobs[jobPartial.status] = 0
            }

            similarJobs[jobPartial.status] += 1
        }

        const thumbnail = await this.metadataHelper.getThumbnail(gcodeFile)
        const graph = await historyGraph.renderGraph(
            {
                count: Object.keys(similarJobs).length,
                stats: similarJobs
            })

        const embedData = await this.embedHelper.generateEmbed('history_detail', job)
        const embed = embedData.embed.embeds[0]

        embed.setThumbnail(`attachment://${thumbnail.name}`)
        embed.setImage(`attachment://${graph.name}`)

        embedData.embed.embeds = [embed]
        embedData.embed['files'] = [thumbnail, graph]

        const currentMessage = interaction.message as Message

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit(embedData.embed)

        await interaction.deleteReply()
    }
}