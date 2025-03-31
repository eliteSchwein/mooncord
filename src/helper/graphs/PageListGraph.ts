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

        const offset = 100
        const resWidth = 300
        const resHeight = 1200

        let currentOffset = 0

        let svg = `<svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 ${resWidth} ${resHeight}">
        `

        let graphTemplate = readFileSync(path.resolve(__dirname, `../assets/${graphFile}`)).toString('utf8')

        graphTemplate = graphTemplate
            .replace(/<svg[^>]*>|<\/svg>/gi, '')
            .replace(/inkscape:[^\n]*/gi, '')
            .replace(/xmlns:inkscape[^\n]*/gi, '')
            .replace(/<sodipodi:namedview[^>]*>/gi, '')


        for(const graphDataEntry of graphData) {
            const graphEntry = graphDataEntry[graphEntryKey]
            const graphEntryParameters = []
            let graphEntryTemplate = `${graphTemplate}`

            graphEntryTemplate = graphEntryTemplate
                .replace(/(<g\n)|(<g )/gi, `<g transform="translate(0, ${currentOffset})"\n`)

            currentOffset += offset

            for(const originalParam of graphParameters) {
                const graphParameter = {...originalParam}
                graphParameter.value = await this.templateHelper.parsePlaceholder(graphParameter.value, {graph_entry: graphEntry})

                graphEntryParameters.push(graphParameter)
            }

            svg = `
                ${svg}
                ${graphEntryTemplate}
            `
        }

        svg = `
            ${svg}
            </svg>
        `

        return await this.convertSvg(svg)
    }
}