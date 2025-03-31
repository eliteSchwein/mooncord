import BaseGraph from "./BaseGraph";
import {TemplateHelper} from "../TemplateHelper";
import path from "path";
import {readFileSync} from "fs";
import {waitUntil} from "async-wait-until";

export default class PageListGraph extends BaseGraph {
    filename = 'pageGraph.png'

    protected templateHelper = new TemplateHelper()
    protected finishedParameters = {}
    protected colors = this.config.getColors(/(.*?)/g, true)

    public async renderGraph(data: any) {
        const graphData = data.graph_data
        const graphParameters = data.graphparameter
        const graphEntryKey = data.graph_entry_key
        const graphFile = data.graph_file

        const offset = data.graph_entry_offset
        const resWidth = data.graph_width
        const resHeight = data.graph_height

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

        await waitUntil(() =>
            Object.keys(this.finishedParameters).length === graphData.length,
            {timeout: 30_000, intervalBetweenAttempts: 500}
        )

        for(const graphDataEntry of graphData) {
            const graphEntry = graphDataEntry[graphEntryKey]
            const graphEntryParameters = this.finishedParameters[graphEntry]
            let graphEntryTemplate = `${graphTemplate}`

            graphEntryTemplate = graphEntryTemplate
                .replace(/<g\b([^>]*?)\s*transform=".*?"([^>]*)>/gi, '<g$1$2>')
                .replace(/(<g\n)|(<g )/gi, `<g transform="translate(0, ${currentOffset})"\n`)

            for(const graphParameter of graphEntryParameters) {
                switch(graphParameter.type) {
                    case 'text':
                        graphEntryTemplate = graphEntryTemplate.replace(
                            new RegExp(
                                `<text[^>]*id="${graphParameter.id}"[^>]*>\\s*<tspan[^>]*>.*?<\\/tspan>\\s*<\\/text>`,
                                'gs'
                            ),
                            (match) => {
                                return match.replace(/(<tspan[^>]*>)(.*?)(<\/tspan>)/s, `$1${graphParameter.value}$3`);
                            }
                        )
                        break
                    case 'image':
                        const imageRegex = new RegExp(
                            `<image[^>]*?\\bid=["']${graphParameter.id}["'][^>]*?>`,
                            'is'
                        )

                        graphEntryTemplate = graphEntryTemplate.replace(
                            imageRegex,
                            match => match.replace(/xlink:href=["'][^"']*["']/, `xlink:href="${graphParameter.value}"`)
                        )
                        break
                    case 'background':
                        const bgRegex = new RegExp(
                            `(<[^>]*id=["']${graphParameter.id}["'][^>]*?style=["'][^"']*)fill:[^;]+`,
                            'is'
                        )

                        graphEntryTemplate = graphEntryTemplate.replace(
                            bgRegex,
                            `$1fill:${graphParameter.value}`
                        )
                        break
                }
            }

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

            if(graphParameter.type === 'image' && !graphParameter.value.includes('base64')) {
                const rawImage = readFileSync(path.resolve(__dirname, `../assets/${graphParameter.value}`))
                graphParameter.value =`data:image/png;base64,${rawImage.toString("base64")}`
            }

            if(graphParameter.type === 'background') {
                graphParameter.value = `#${this.colors[graphParameter.value].color}`
            }

            graphEntryParameters.push(graphParameter)
        }

        this.finishedParameters[graphEntry] = graphEntryParameters
    }
}