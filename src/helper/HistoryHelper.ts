'use strict'

import {getMoonrakerClient} from "../Application";
import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {LocaleHelper} from "./LocaleHelper";
import HistoryGraph from "./graphs/HistoryGraph";

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
        const moonrakerClient = getMoonrakerClient()
        const printJobsRequest = await moonrakerClient.send({"method": "server.history.totals"})
        const printTotalRequest = await moonrakerClient.send({"method": "server.history.list"})

        if (printJobsRequest.result === undefined || printTotalRequest.result === undefined) {
            return
        }

        const cache = getEntry('history')

        cache.total = printJobsRequest.result
        cache.jobs = printTotalRequest.result

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
                printStats.stats[printJob.status] = 1
                continue
            }
            printStats.stats[printJob.status] += 1
        }

        return printStats
    }

    public parseFields() {
        const chartConfigSection = new HistoryGraph().getIcons()
        const printStats = this.getPrintStats()
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