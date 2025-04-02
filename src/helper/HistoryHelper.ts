'use strict'

import {getMoonrakerClient} from "../Application";
import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {LocaleHelper} from "./LocaleHelper";
import {getIcons, mergeDeep} from "./DataHelper";
import {waitUntil} from "async-wait-until";

export class HistoryHelper {
    protected moonrakerClient = getMoonrakerClient()
    protected jobListResult = {
        count: 0,
        jobs: []
    }

    public getPrintJobStats() {
        const cache = getEntry('history')

        return {
            printTotals: cache.total,
            printJobs: cache.jobs
        }
    }

    private async parsePartialJobList(start: number, totalLimit: number) {
        const printJobsCommand = {"method": "server.history.list", "params": {"limit": totalLimit, "start": start}}

        const jobListPartialResult = await this.moonrakerClient.send(printJobsCommand)

        console.log(jobListPartialResult.result)

        if(jobListPartialResult.result.count) {
            this.jobListResult.count += jobListPartialResult.result.count
        }

        if (Array.isArray(jobListPartialResult.result.jobs)) {
            const cleanedJobs = jobListPartialResult.result.jobs.map(job => {
                const { metadata, auxiliary_data, ...cleanedJob } = job
                return cleanedJob
            })
            this.jobListResult.jobs.push(...cleanedJobs)
        }
    }

    public async parseData() {
        logRegular('Retrieve history data...')
        const totalLimit = 50
        const printTotalRequest = await this.moonrakerClient.send({"method": "server.history.totals"})

        if (printTotalRequest.result === undefined) {
            return
        }

        const loopLimit = Math.ceil(printTotalRequest.result.job_totals.total_jobs / totalLimit)

        this.jobListResult = {
            count: 0,
            jobs: []
        }

        for (let i = 0; i < loopLimit; i++) {
            const start = i > 0 ? totalLimit * i + 1 : 0

            void this.parsePartialJobList(start, totalLimit)
        }

        await waitUntil(() => {
            console.log(this.jobListResult.count)
                console.log(printTotalRequest.result.job_totals.total_jobs)
            return this.jobListResult.count === printTotalRequest.result.job_totals.total_jobs
            },
            {timeout: 60_000, intervalBetweenAttempts: 500})

        const cache = getEntry('history')

        this.jobListResult.jobs.sort((a, b) => {
            return b.job_id.localeCompare(a.job_id)
        })

        console.log(this.jobListResult)

        cache.total = printTotalRequest.result
        cache.jobs = this.jobListResult

        setData('history', cache)

        this.jobListResult = {
            count: 0,
            jobs: []
        }
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