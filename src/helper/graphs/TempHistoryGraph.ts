import * as metaData from "../../meta/temp_history_meta.json"
import {ConfigHelper} from "../ConfigHelper";

export default class TempHistoryGraph {
    protected configHelper = new ConfigHelper()
    protected colors = []

    public constructor() {
        this.colors = this.configHelper.getIcons(/temp\d+$/g)
    }

    public getColors() {
        return this.colors
    }
}