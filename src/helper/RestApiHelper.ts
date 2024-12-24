import {ConfigHelper} from "./ConfigHelper";
import axios from "axios";
import {setData} from "../utils/CacheUtil";

const apiEndpoints = {
    timelapse_settings: "machine/timelapse/settings"
}
// key = cache key
// value = endpoint

export async function updateAllRestEndpoints() {
    for(const key of Object.keys(apiEndpoints)) {
        await updateRestEndpoint(key)
    }
}

export async function updateRestEndpoint(key: string) {
    try {
        const config = new ConfigHelper()

        const endpoint = apiEndpoints[key]

        const result = await axios.get(`${config.getMoonrakerUrl()}/${endpoint}`)

        let data = result.data

        if(typeof data === "string") {
            data = JSON.parse(data)
        }

        setData(key, data.result);
    } catch (error) {
        setData(key, {});
    }
}