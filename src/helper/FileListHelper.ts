import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";
import {MoonrakerClient} from "../clients/MoonrakerClient";

export class FileListHelper {
    protected moonrakerClient

    public constructor(moonrakerClient: MoonrakerClient) {
        this.moonrakerClient = moonrakerClient
    }

    public async retrieveGcodeFiles() {
        logRegular('Retrieve current GCode Files...')
        const currentFiles = await this.moonrakerClient.send({"method": "server.files.list", "params": {"root": "gcodes"}})

        setData('gcode_files', currentFiles.result)
    }

    public async retrieveConfigFiles() {
        logRegular('Retrieve Config Files...')
        const currentFiles = await this.moonrakerClient.send({"method": "server.files.list", "params": {"root": "config"}})

        setData('config_files', currentFiles.result)
    }

    public getCurrentFiles() {
        return getEntry('gcode_files')
    }
}