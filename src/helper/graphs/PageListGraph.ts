import BaseGraph from "./BaseGraph";
import path from "path";
import {existsSync, readFileSync} from "fs";
import {waitUntil} from "async-wait-until";

export default class PageListGraph extends BaseGraph {
    filename = 'pageGraph.png'

    protected finishedParameters = {}
    protected colors = this.config.getColors(/(.*?)/g, true)

    public async renderGraph(data: any) {
        const graphData = data.graph_data
        const graphConfig = this.config.getEntriesByFilter(new RegExp(`^page_graph ${data.graph_id}`, 'g'))[0]

        const graphParameters = graphConfig.parameter
        const graphEntryKey = graphConfig.entry_key
        const graphFile = graphConfig.file

        const offset = graphConfig.entry_offset
        const resWidth = graphConfig.width
        const resHeight = graphConfig.height

        let currentOffset = 0

        const imagePath = path.resolve(__dirname, `../assets/${graphFile}`)

        if(!existsSync(imagePath)) {
            return await this.convertSvg(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="1" height="1">
            </svg>
            `)
        }

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

        let graphTemplate = readFileSync(imagePath).toString('utf8')

        graphTemplate = graphTemplate
            .replace(/<!--[^>]*>|<\?xml[^>]*>|<svg[^>]*>|<\/svg>/gi, '')
            .replace(/inkscape:[^\n]*/gi, '')
            .replace(/sodipodi:[^\n]*/gi, '')
            .replace(/xmlns:inkscape[^\n]*/gi, '')
            .replace(/<sodipodi:namedview[^>]*>/gi, '')

        await waitUntil(() =>
            Object.keys(this.finishedParameters).length === graphData.length,
            {timeout: 30_000, intervalBetweenAttempts: 250}
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
                    case 'fill':
                        const bgRegex = new RegExp(
                            `(<[^>]*id=["']${graphParameter.id}["'][^>]*?style=["'][^"']*)fill:[^;]+`,
                            'is'
                        )

                        graphEntryTemplate = graphEntryTemplate.replace(
                            bgRegex,
                            `$1fill:${graphParameter.value}`
                        )
                        break
                    case 'stroke':
                        const stRegex = new RegExp(
                            `(<[^>]*id=["']${graphParameter.id}["'][^>]*?style=["'][^"']*)stroke:[^;]+`,
                            'is'
                        )

                        graphEntryTemplate = graphEntryTemplate.replace(
                            stRegex,
                            `$1stroke:${graphParameter.value}`
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

            if(graphParameter.type === 'fill' || graphParameter.type === 'stroke') {
                graphParameter.value = `#${this.colors[graphParameter.value].color}`
            }

            graphEntryParameters.push(graphParameter)
        }

        console.log(graphEntryParameters)

        this.finishedParameters[graphEntry] = graphEntryParameters
    }
}