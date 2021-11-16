import { getMoonrakerClient } from "../Application";
import { MoonrakerClient } from "../clients/MoonrakerClient";
import { setData } from "../utils/CacheUtil";

export class MetadataHelper {
    protected moonrakerClient: MoonrakerClient

    public constructor(moonrakerClient: MoonrakerClient = null) {
        if(moonrakerClient !== null) {
            this.moonrakerClient = moonrakerClient
        } else {
            this.moonrakerClient = getMoonrakerClient()
        }
    }

    public async retrieveMetaData(filename: string) {
        const metaData = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${filename}"}}`)

        setData('meta_data', metaData.result)
    }
}