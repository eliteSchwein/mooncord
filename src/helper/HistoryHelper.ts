'use strict'

import {getMoonrakerClient} from "../Application";
import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {LocaleHelper} from "./LocaleHelper";
import {getIcons, mergeDeep} from "./DataHelper";

export class HistoryHelper {
    public getPrintJobStats() {
        const cache = getEntry('history')

        return {
            printTotals: cache.total,
            printJobs: cache.jobs
        }
    }

    public async parseData() {
        logRegular('Retrieve history data...')
        const totalLimit = 50
        const moonrakerClient = getMoonrakerClient()
        const printTotalRequest = await moonrakerClient.send({"method": "server.history.totals"})
        const printJobsCommand = {"method": "server.history.list", "params": {"limit": totalLimit, "start": 0}}

        if (printTotalRequest.result === undefined) {
            return
        }

        const loopLimit = Math.ceil(printTotalRequest.result.job_totals.total_jobs / totalLimit)

        const jobListResult = {
            count: printTotalRequest.result.job_totals.total_jobs,
            jobs: []
        }

        for (let i = 0; i < loopLimit; i++) {
            printJobsCommand.params.start = i > 0 ? totalLimit * i + 1 : 0

            const jobListPartialResult = await moonrakerClient.send(printJobsCommand)

            if (Array.isArray(jobListPartialResult.result.jobs)) {
                jobListResult.jobs.push(...jobListPartialResult.result.jobs);
            }
        }

        console.log(jobListResult)

        const cache = getEntry('history')

        cache.total = printTotalRequest.result
        cache.jobs = jobListResult

        setData('history', cache)
    }

    public getPrintJobs() {
        return this.getPrintJobStats().printJobs
    }

    public getPrintTotals() {
        return this.getPrintJobStats().printTotals
    }

    public getPrintStats() {
        const printJobs = this.getPrintJobs()

        const printStats = {
            count: printJobs.count,
            stats: {}
        }

        if (printJobs.jobs === undefined) {
            printStats.count = 0
            return printStats
        }

        for (const printJob of printJobs.jobs) {
            if (printStats.stats[printJob.status] === undefined) {
                printStats.stats[printJob.status] = 0
            }
            printStats.stats[printJob.status] += 1
        }

        return printStats
    }

    public parseFields(printStats = this.getPrintStats()) {
        const chartConfigSection = getIcons()
        const locale = new LocaleHelper().getLocale()
        const fields = []

        for (const printStat in printStats.stats) {
            const printStatCount = printStats.stats[printStat]
            const valueData = []
            const fieldData = {
                name: printStat,
                value: '',
                inline: true
            }

            valueData.push(`\`${locale.embeds.fields.count}\`:${printStatCount}`)
            valueData.push(`\`${locale.embeds.fields.color}\`:${chartConfigSection[printStat].icon}`)

            fieldData.value = valueData.join('\n')

            fields.push(fieldData)
        }

        return fields
    }
}