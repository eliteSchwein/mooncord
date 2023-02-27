import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";

export class FileListHelper {
    protected moonrakerClient

    public constructor(moonrakerClient: MoonrakerClient) {
        this.moonrakerClient = moonrakerClient
    }

    public retrieveFiles(root: string, cacheKey: string, filter?: RegExp) {
        logRegular(`Retrieve Files from ${root}...`)
        const message = {"method": "server.files.list", "params": {"root": root}}
        new Promise(async (resolve, reject) => {
            const currentFiles = await this.moonrakerClient.send(message)

            const result = currentFiles.result

            if (result === null || result === undefined) {
                return
            }

            if (filter !== undefined && filter !== null) {
                const filteredResult = []

                for (const resultPartial of result) {
                    if (!filter.test(resultPartial.path)) {
                        continue
                    }
                    filteredResult.push(resultPartial)
                }

                setData(cacheKey, filteredResult)
                return
            }

            setData(cacheKey, result)
        })
    }

    public getCurrentFiles() {
        return getEntry('gcode_files')
    }
}