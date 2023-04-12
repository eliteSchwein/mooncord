import {ConfigHelper} from "../ConfigHelper";
import * as metaData from "../../meta/history_graph_meta.json"

export default class HistoryGraph {
    protected configHelper = new ConfigHelper()

    public getIcons() {
        const icons:any = {}

        for(const iconKey of metaData.icons) {
            const iconData = this.configHelper.getIcons(new RegExp(`${iconKey}`, 'g'))

            if(iconData.length === 0) {
                continue
            }

            icons[iconKey] = iconData[0]
        }

        return icons
    }
}