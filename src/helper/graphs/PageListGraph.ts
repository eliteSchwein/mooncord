import BaseGraph from "./BaseGraph";
import {TemplateHelper} from "../TemplateHelper";
import path from "path";
import {readFileSync} from "fs";
import {waitUntil} from "async-wait-until";

export default class PageListGraph extends BaseGraph {
    filename = 'pageGraph.png'

    protected templateHelper = new TemplateHelper()
    protected finishedParameters = {}

    public async renderGraph(data: any) {
        const graphData = data.graph_data
        const graphParameters = data.graphparameter
        const graphEntryKey = data.graph_entry_key
        const graphFile = data.graph_file

        const offset = 150
        const resWidth = 1200
        const resHeight = 1400

        let currentOffset = 0

        for(const graphDataEntry of graphData) {
            const graphEntry = graphDataEntry[graphEntryKey]
            void this.parseParameters(graphParameters, graphEntry)
        }

        let svg = `<svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 ${resWidth} ${resHeight}">
        `

        let graphTemplate = readFileSync(path.resolve(__dirname, `../assets/${graphFile}`)).toString('utf8')

        graphTemplate = graphTemplate
            .replace(/<!--[^>]*>|<\?xml[^>]*>|<svg[^>]*>|<\/svg>/gi, '')
            .replace(/inkscape:[^\n]*/gi, '')
            .replace(/sodipodi:[^\n]*/gi, '')
            .replace(/xmlns:inkscape[^\n]*/gi, '')
            .replace(/<sodipodi:namedview[^>]*>/gi, '')

        await waitUntil(() => {
            console.log(Object.keys(this.finishedParameters).length)
            console.log(graphData.length)
            return Object.keys(this.finishedParameters).length === graphData.length
        }, {timeout: 30_000, intervalBetweenAttempts: 500})

        for(const graphDataEntry of graphData) {
            const graphEntry = graphDataEntry[graphEntryKey]
            const graphEntryParameters = this.finishedParameters[graphEntryKey]
            let graphEntryTemplate = `${graphTemplate}`

            graphEntryTemplate = graphEntryTemplate
                .replace(/<g\b([^>]*?)\s*transform=".*?"([^>]*)>/gi, '<g$1$2>')
                .replace(/(<g\n)|(<g )/gi, `<g transform="translate(0, ${currentOffset})"\n`)

            currentOffset += offset

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

    private async parseParameters(graphParameters: any, graphEntry: any) {
        const graphEntryParameters = []

        for(const originalParam of graphParameters) {
            const graphParameter = {...originalParam}
            graphParameter.value = await this.templateHelper.parsePlaceholder(graphParameter.value, {graph_entry: graphEntry})

            graphEntryParameters.push(graphParameter)
        }

        this.finishedParameters[graphEntry] = graphEntryParameters
    }
}