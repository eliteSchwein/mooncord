'use strict'

import {getMoonrakerClient} from "../Application";
import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {ConfigHelper} from "./ConfigHelper";
import {LocaleHelper} from "./LocaleHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";
import HistoryGraph from "./graphs/HistoryGraph";

export class HistoryHelper {
    protected moonrakerClient = getMoonrakerClient()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected printJobs = {
        jobs: [],
        count: 0
    }
    protected printTotals = {}
    protected cache = getEntry('history')

    public constructor(moonrakerClient: MoonrakerClient = undefined) {
        if (moonrakerClient !== undefined) {
            this.moonrakerClient = moonrakerClient
        }
        this.printJobs = this.cache.jobs
        this.printTotals = this.cache.total
    }

    public async parseData() {
        logRegular('Retrieve history data...')
        const printJobsRequest = await this.moonrakerClient.send({"method": "server.history.list"})
        const printTotalRequest = await this.moonrakerClient.send({"method": "server.history.totals"})

        if (printJobsRequest.result === undefined || printTotalRequest.result === undefined) {
            return
        }

        this.printJobs = printJobsRequest.result
        this.printTotals = printTotalRequest.result

        this.cache.total = this.printTotals
        this.cache.jobs = this.printJobs

        setData('history', this.cache)
    }

    public getPrintJobs() {
        return this.printJobs
    }

    public getPrintTotals() {
        return this.printTotals
    }

    public getPrintStats() {
        const printStats = {
            count: this.printJobs.count,
            stats: {}
        }

        if (this.printJobs.jobs === undefined) {
            printStats.count = 0
            return printStats
        }

        for (const printJob of this.printJobs.jobs) {
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
        const fields = []

        for (const printStat in printStats.stats) {
            const printStatCount = printStats.stats[printStat]
            const valueData = []
            const fieldData = {
                name: printStat,
                value: '',
                inline: true
            }

            valueData.push(`\`${this.locale.embeds.fields.count}\`:${printStatCount}`)
            valueData.push(`\`${this.locale.embeds.fields.color}\`:${chartConfigSection[printStat].icon}`)

            fieldData.value = valueData.join('\n')

            fields.push(fieldData)
        }

        return fields
    }
}