'use strict'

import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";
import {MetadataHelper} from "./MetadataHelper";
import {ConfigHelper} from "./ConfigHelper";
import HistoryGraph from "./graphs/HistoryGraph";
import {getMoonrakerClient} from "../Application";
import {HistoryHelper} from "./HistoryHelper";

export class FileListHelper {
    public retrieveFiles(root: string, cacheKey: string, filter?: RegExp) {
        logRegular(`Retrieve Files from ${root}...`)
        const moonrakerClient = getMoonrakerClient()

        const message = {"method": "server.files.list", "params": {"root": root}}
        new Promise(async (resolve, reject) => {
            const currentFiles = await moonrakerClient.send(message)

            let result = currentFiles.result

            if (result === null || result === undefined) {
                return
            }

            result.sort((a, b) => (a.modified < b.modified) ? 1: -1)

            if (filter !== undefined && filter !== null) {
                const filteredResult = []

                for (const resultPartial of result) {
                    if (!filter.test(resultPartial.path)) {
                        continue
                    }
                    filteredResult.push(resultPartial)
                }

                result = filteredResult
            }

            setData(cacheKey, result)

            if(root === 'gcodes') {
                const tempResult = []
                const historyCache = getEntry('history')

                if(historyCache === undefined || historyCache.jobs === undefined) {
                    for(const resultPartial of result) {
                        resultPartial.label = resultPartial.path
                        tempResult.push(resultPartial)
                    }

                    setData(cacheKey, tempResult)
                    return
                }

                const jobs = historyCache.jobs.jobs
                const iconConfig = new HistoryGraph().getIcons()

                for(const resultPartial of result) {
                    let partialJobs = jobs.filter((element) => {return resultPartial.path === element.filename})

                    if(partialJobs.length === 0) {
                        resultPartial.label = resultPartial.path
                        tempResult.push(resultPartial)
                        continue
                    }

                    partialJobs.sort((a, b) => (a.start_time < b.start_time) ? 1: -1)

                    const lastStatus = partialJobs[0].status

                    partialJobs = partialJobs.filter((element => {return element.status === lastStatus}))

                    if(lastStatus === 'in_progress') {
                        resultPartial.label = `${resultPartial.path} ${iconConfig.in_progress.list_icon}`
                    } else {
                        resultPartial.label = `${resultPartial.path} ${partialJobs.length}${iconConfig[lastStatus].list_icon}`
                    }

                    tempResult.push(resultPartial)
                }

                setData(cacheKey, tempResult)
            }
        })
    }

    public getCurrentFiles() {
        return getEntry('gcode_files')
    }
}