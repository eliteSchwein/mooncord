import {ConfigHelper} from "../ConfigHelper";
import * as metaData from "../../meta/history_graph_meta.json"

export default class HistoryGraph {
    protected configHelper = new ConfigHelper()

    public getIcons() {
        const icons = {}

        for(const iconKey of metaData.icons) {
            const iconData = this.configHelper.getIcons(new RegExp(`${iconKey}`, 'g'))

            console.log(iconKey)
        }

        console.log('history graph icons')
        console.log(metaData.icons)

        return this.configHelper.getIcons(/temp\d+$/g)
    }
}