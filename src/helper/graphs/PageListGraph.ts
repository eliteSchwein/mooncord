import BaseGraph from "./BaseGraph";
import {TemplateHelper} from "../TemplateHelper";
import path from "path";
import {readFileSync} from "fs";

export default class PageListGraph extends BaseGraph {
    filename = 'pageGraph.png'

    protected templateHelper = new TemplateHelper()

    public async renderGraph(data: any) {
        const graphData = data.graph_data
        const graphParameters = data.graphparameter
        const graphEntryKey = data.graph_entry_key
        const graphFile = data.graph_file

        const graphTemplate = readFileSync(path.resolve(__dirname, `../assets/${graphFile}`))

        console.log(graphTemplate)

        for(const graphDataEntry of graphData) {
            const graphEntry = graphDataEntry[graphEntryKey]
            const graphEntryParameters = []

            for(const originalParam of graphParameters) {
                const graphParameter = {...originalParam}
                graphParameter.value = await this.templateHelper.parsePlaceholder(graphParameter.value, {graph_entry: graphEntry})

                graphEntryParameters.push(graphParameter)
            }

            console.log(graphEntryParameters)
        }

        return await this.convertSvg('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')
    }
}