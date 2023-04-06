import * as metaData from "../../meta/temp_history_meta.json"
import {ConfigHelper} from "../ConfigHelper";

export default class TempHistoryGraph {
    protected configHelper = new ConfigHelper()

    public constructor() {
    }

    public getColors() {
        return this.configHelper.getIcons(/temp\d+$/g)
    }
}