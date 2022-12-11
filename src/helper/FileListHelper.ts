import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";

export class FileListHelper {
    protected moonrakerClient

    public constructor(moonrakerClient: MoonrakerClient) {
        this.moonrakerClient = moonrakerClient
    }

    public retrieveFiles(root:string, cacheKey: string) {
        logRegular(`Retrieve Files from ${root}...`)
        const message = {"method": "server.files.list", "params": {"root": root}}
        new Promise(async (resolve, reject) => {
            const currentFiles = await this.moonrakerClient.send(message)

            setData(cacheKey, currentFiles.result)
        })
    }

    public getCurrentFiles() {
        return getEntry('gcode_files')
    }
}