import BaseSelection from "../abstracts/BaseSelection";
import {StringSelectMenuInteraction} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import _ from "lodash";

export class HistoryDetail extends BaseSelection {
    selectionId = 'history_detail_select'

    async handleSelection(interaction: StringSelectMenuInteraction) {
        const jobId = interaction.values[0]
        const jobs = getEntry('history').jobs.jobs
        const similarJobs = {
            klippy_shutdown: [],
            error: [],
            cancelled: [],
            interrupted: [],
            completed: [],
            in_progress: []
        }

        const job = _.find(jobs, { id: jobId })

        for(const jobPartial of jobs) {
            if(jobPartial.filename !== job.filename) continue

            similarJobs[jobPartial.status].push(jobPartial)
        }
    }
}