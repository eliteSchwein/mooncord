import * as App from '../Application';
import {ConfigHelper} from './ConfigHelper';
import {LocaleHelper} from './LocaleHelper';
import {getEntry} from '../utils/CacheUtil';
import {logRegular} from './LoggerHelper';
import QuickChart from "quickchart-js";
import {sleep} from "./DataHelper";
import {MessageAttachment} from "discord.js";
import sharp from "sharp";

export class GraphHelper {
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected tempValueLimit = 0
    protected tempCache = getEntry('temps')
    protected functionCache = getEntry('function')
    protected stateCache = getEntry('state')

    public async getExcludeGraph(currentObject: string) {
        const excludeObjects = this.stateCache.exclude_object.objects
        const excludedObjects = this.stateCache.exclude_object.excluded_objects
        const axisMaximum = this.stateCache.toolhead.axis_maximum
        const graphMeta = this.configHelper.getGraphConfig('exclude_graph')
        const borderColor = graphMeta.border_color

        logRegular('render exclude object graph...')

        let svg = `<svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 ${axisMaximum[0]} ${axisMaximum[1]}">
            <rect x="0" y="0" width="${axisMaximum[0]}" height="${axisMaximum[1]}" fill="${graphMeta.background_color}"/>
        `

        for(const excludeObject of excludeObjects) {
            const polygons = excludeObject.polygon.join(' ')
            let color = graphMeta.inactive_color

            if(excludedObjects.includes(excludeObject.name)) {
                color = graphMeta.excluded_color
            }
            if(excludeObject.name === currentObject) {
                color = graphMeta.active_color
            }

            svg = `
${svg}
    <polygon points="${polygons}" fill="${color}" stroke="${borderColor}"/>
            `
        }

        svg = `
${svg}
</svg>
`
        const graphBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
        return new MessageAttachment(graphBuffer, 'excludeGraph.png')
    }

    public async getTempGraph(sensor = undefined) {
        const moonrakerClient = App.getMoonrakerClient()
        const chartConfigSection = this.configHelper.getGraphConfig('temp_history')
        const tempLabel = this.locale.graph.temp_history.temperature
        const powerLabel = this.locale.graph.temp_history.power

        this.tempValueLimit = chartConfigSection.value_limit

        const tempHistoryRequest = await moonrakerClient.send({'method': 'server.temperature_store'})

        if(typeof tempHistoryRequest.error !== 'undefined') {
            return
        }
        const resHeight = 600

        let max = 0
        let width = 0
        const rawLines = []
        const lines = []

        for(const sensorIndex in tempHistoryRequest.result) {
            const sensorLabel = sensorIndex.replace(/(temperature_sensor )|(temperature_fan )|(heater_generic )/g, '')

            if(sensor !== undefined && sensorLabel !== sensor) {
                continue
            }

            const sensorData = tempHistoryRequest.result[sensorIndex]
            const color = this.tempCache.colors[sensorIndex].color
            const sensorTempMax = Math.max.apply(null, sensorData.temperatures)
            const sensorTargetMax = Math.max.apply(null, sensorData.targets)

            if(max < sensorTempMax) {
                max = Math.ceil((sensorTempMax+1)/10)*10
            }

            if(max < sensorTargetMax) {
                max = Math.ceil((sensorTargetMax+1)/10)*10
            }

            if(width < sensorData.temperatures.length) {
                width = sensorData.temperatures.length
            }

            rawLines.push({
                label: sensorLabel,
                temperatures: sensorData.temperatures,
                targets: sensorData.targets,
                powers: sensorData.powers,
                color: color,
                type: 'temp'
            })
        }

        const graphWidth = width
        width += 200

        for(const lineData of rawLines) {
            if(lineData.type === 'temp') {
                lines.push({
                    label: lineData.label,
                    color: lineData.color,
                    type: 'temp',
                    coords: this.convertToCoords(lineData.temperatures, max, resHeight)
                })

                lines.push({
                    label: lineData.label,
                    color: lineData.color,
                    type: 'target',
                    coords: this.convertToCoords(lineData.targets, max, resHeight)
                })
            }
        }

        const tempLabels = this.generateIntervalsOf(10, 0, max+5)
        const tempLabelSpace = resHeight / (tempLabels.length - 1)

        let svg = `<svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 ${width} ${resHeight}">
            <g transform="translate(200,0)">
            `

        for(const line of lines) {
            if(line.coords === undefined) {
                continue
            }
            svg = `
                ${svg}
                <polyline points="${line.coords.join(' ')}" style="fill:none;stroke:${line.color};stroke-width:5" />
            `
        }
        svg =`
            ${svg}
            </g>
            `

        let heightIndex = 0

        for(const tempLabel of tempLabels) {
            console.log(heightIndex*tempLabelSpace)
            svg = `
                ${svg}
                <text x="60" dy="${resHeight-heightIndex*tempLabelSpace}" style="font: bold 30px sans-serif;fill: gray">${tempLabel}</text>
            `
            heightIndex++
        }

        svg = `
            ${svg}
            </svg>
        `
        const graphBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
        return new MessageAttachment(graphBuffer, 'tempGraph.png')
    }

    private convertToCoords(values: [], max: number, resHeight = 400) {
        const coords = []
        let widthIndex = 0

        if(values === undefined) { return }

        for(const value of values) {
            coords.push(`${widthIndex},${resHeight - ((((value * 100) / max) / 100) * resHeight)}`)
            widthIndex++
        }

        return coords
    }

    private generateIntervalsOf(interval, start, end) {
        const result = [];
        let current = start;

        while (current < end) {
            result.push(current);
            current += interval;
        }

        return result;
    }
}