import * as App from '../Application';
import {ConfigHelper} from './ConfigHelper';
import {LocaleHelper} from './LocaleHelper';
import {getEntry} from '../utils/CacheUtil';
import {logRegular} from './LoggerHelper';
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
        const serverConfigCache = getEntry('server_config')
        const tempLabel = this.locale.graph.temp_history.temperature
        const powerLabel = this.locale.graph.temp_history.power
        const powerColor = chartConfigSection.power_color

        this.tempValueLimit = chartConfigSection.value_limit

        const tempHistoryRequest = await moonrakerClient.send({'method': 'server.temperature_store'})

        if(typeof tempHistoryRequest.error !== 'undefined') {
            return
        }
        const resHeight = 600
        const offsetHeight = resHeight - 30

        let max = 0
        let width = serverConfigCache.config.data_store.temperature_store_size
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
        width += 120
        if(sensor !== undefined) {
            width += 120
        }

        let tempLabels = this.generateIntervalsOf(10, 0, max+5)
        if(tempLabels.length > 12) {
            tempLabels = this.generateIntervalsOf(20, 0, max+15)
        }
        if(tempLabels.length > 24) {
            tempLabels = this.generateIntervalsOf(30, 0, max+25)
        }

        max = tempLabels[tempLabels.length - 1]

        for(const lineData of rawLines) {
            if(lineData.type === 'temp') {
                lines.push({
                    label: lineData.label,
                    color: lineData.color,
                    type: 'temp',
                    coords: this.convertToCoords(lineData.temperatures, max, offsetHeight, resHeight)
                })

                lines.push({
                    label: lineData.label,
                    color: lineData.color,
                    type: 'target',
                    coords: this.convertToCoords(lineData.targets, max, offsetHeight, resHeight)
                })

                if(sensor !== undefined) {
                    lines.push({
                        label: lineData.label,
                        color: powerColor,
                        type: 'power',
                        coords: this.convertToCoords(lineData.powers, 1, offsetHeight, resHeight)
                    })
                }
            }
        }

        const tempLabelSpace = offsetHeight / (tempLabels.length - 1)
        const powerLabelSpace = offsetHeight / 10

        let svg = `<svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 ${width} ${resHeight}">
            <text x="-300" y="35"
                  style="font: 600 45px Arial;fill: gray;text-anchor: middle" transform="rotate(270)">
                ${tempLabel}
            </text>
            `
        if(sensor !== undefined) {
            svg =`
            ${svg}
            <text x="300" y="-${width-45}"
                  style="font: 600 35px Arial;fill: gray;text-anchor: middle" transform="rotate(90)">
                ${powerLabel}
            </text>
            `
        }
        svg =`
            ${svg}
            <g transform="translate(130,0)">
            `

        for(const line of lines) {
            if(line.coords === undefined) {
                continue
            }
            if(line.type === 'temp' || line.type === 'power') {
                svg = `
                ${svg}
                    <polyline points="${line.coords.join(' ')}" style="fill:none;stroke:${line.color};stroke-width:5" data-label="${line.label}" />
                `
                continue
            }
            if(line.type === 'target') {
                svg = `
                    ${svg}
                    <polygon points="0,${resHeight - 10} ${line.coords.join(' ')} ${graphWidth},${resHeight - 10}" style="fill:${line.color}11;stroke:${line.color}33;stroke-width:5;" data-label="${line.label}" stroke-dasharray="10"/>
                `
            }
        }
        svg =`
            ${svg}
            </g>
            `

        let heightIndex = 0

        for(const tempLabel of tempLabels) {
            svg = `
                ${svg}
                <text x="125" y="${resHeight - heightIndex * tempLabelSpace}" style="font: bold 40px Arial;fill: gray;text-anchor: end">${tempLabel}</text>
                <line x1="130" y1="${resHeight - heightIndex * tempLabelSpace - 10}" x2="${graphWidth + 130}" y2="${resHeight - heightIndex * tempLabelSpace - 10}" style="stroke: rgba(172,172,172,0.2);stroke-width: 3px"></line>
            `
            heightIndex++
        }

        if(sensor !== undefined) {
            for (let i = 0; i < 11; i++) {
                svg = `
                ${svg}
                <text x="${width-105}" y="${resHeight-i*powerLabelSpace}" style="font: bold 40px Arial;fill: gray;text-anchor: start">${i*10}</text>
            `
            }
        }

        svg = `
            ${svg}
            </svg>
        `

        const graphBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
        return new MessageAttachment(graphBuffer, 'tempGraph.png')
    }

    private convertToCoords(values: [], max: number, offsetHeight = 400, resHeight = 600) {
        const coords = []
        let widthIndex = 0

        if(values === undefined) { return }

        for(const value of values) {
            coords.push(`${widthIndex},${resHeight - 10 - ((((value * 100) / max) / 100) * offsetHeight)}`)
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