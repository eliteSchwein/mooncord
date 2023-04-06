import {ConfigHelper} from "../ConfigHelper";
import * as metaData from "../../meta/history_graph_meta.json"

export default class HistoryGraph {
    protected configHelper = new ConfigHelper()

    public getIcons() {
        const icons = {}

        console.log(metaData)

        return this.configHelper.getIcons(/temp\d+$/g)
    }
}