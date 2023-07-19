import {getMoonrakerClient} from "../Application";

export class SpoolmanHelper {
    public async getFields() {
        const moonrakerClient = getMoonrakerClient()

        const request = await moonrakerClient.send({"method": "server.spoolman.get_spool_id"})

        if(request.error !== undefined) {
            return {}
        }

        console.log(request)

        return {}
    }
}