'use strict'

import {getMoonrakerClient} from "../Application";
import {getEntry, getNewExpireAtDate, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {LocaleHelper} from "./LocaleHelper";
import {getIcons} from "./DataHelper";

export class HistoryHelper {
    protected moonrakerClient = getMoonrakerClient()
    protected jobListResult = []

    public async getPrintJobStats() {
       const cache = await this.getCache()

        return {
            printTotals: cache.total,
            printJobs: cache.jobs
        }
    }

    public async getCache() {
        let cache = getEntry('history')

        if (!cache) {
            cache = await this.parseData()
        }

        return cache
    }

    private async parsePartialJobList(start: number, totalLimit: number) {
        const printJobsCommand = {"method": "server.history.list", "params": {"limit": totalLimit, "start": start}}

        const jobListPartialResult = await this.moonrakerClient.send(printJobsCommand)

        if (Array.isArray(jobListPartialResult.result.jobs)) {
            const cleanedJobs = jobListPartialResult.result.jobs.map(job => {
                delete job['auxiliary_data']
                delete job['exists']
                delete job['user']
                if(job['metadata']) {
                    delete job['metadata']['thumbnails']
                    delete job['metadata']['uuid']
                }
                return job
            })
            this.jobListResult.push(...cleanedJobs)
        }
    }

    public async parseData() {
        logRegular('fetch history data...')
        const totalLimit = 25
        const printTotalRequest = await this.moonrakerClient.send({"method": "server.history.totals"})

        if (printTotalRequest.result === undefined) {
            return
        }

        const loopLimit = Math.ceil(printTotalRequest.result.job_totals.total_jobs / totalLimit)

        this.jobListResult = []

        const jobListResult = {
            count: printTotalRequest.result.job_totals.total_jobs,
            jobs: []
        }

        const promises = []

        for (let i = 0; i < loopLimit; i++) {
            const start = i > 0 ? totalLimit * i + 1 : 0

            promises.push(this.parsePartialJobList(start, totalLimit))
        }

        await Promise.all(promises)

        const cache = {
            total: undefined,
            jobs: undefined,
            expires_at: undefined
        }

        jobListResult.jobs = this.jobListResult

        jobListResult.jobs.sort((a, b) => {
            return b.job_id.localeCompare(a.job_id)
        })

        delete printTotalRequest.result['auxiliary_totals']

        cache.total = printTotalRequest.result
        cache.jobs = jobListResult
        cache.expires_at = getNewExpireAtDate()

        setData('history', cache)

        this.jobListResult = []

        return cache
    }

    public async getPrintJobs() {
        return (await this.getPrintJobStats()).printJobs
    }

    public async getPrintTotals() {
        return (await this.getPrintJobStats()).printTotals
    }

    public async getPrintStats() {
        const printJobs = await this.getPrintJobs()

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

    public async parseFields(printStats = undefined) {
        if(!printStats) {
            printStats = await this.getPrintStats()
        }
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