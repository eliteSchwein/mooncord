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

        this.tempValueLimit = chartConfigSection.value_limit

        const tempHistoryRequest = await moonrakerClient.send({'method': 'server.temperature_store'})

        if(typeof tempHistoryRequest.error !== 'undefined') {
            return
        }
        const resHeight = 400
        const resWidth = 800
        const graphWidth = resWidth - 200

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

        for(const lineData of rawLines) {
            if(lineData.type === 'temp') {
                lines.push({
                    label: lineData.label,
                    color: lineData.color,
                    type: 'temp',
                    coords: this.convertToCoords(lineData.temperatures, width, max, resHeight, graphWidth)
                })

                lines.push({
                    label: lineData.label,
                    color: lineData.color,
                    type: 'target',
                    coords: this.convertToCoords(lineData.targets, width, max, resHeight, graphWidth)
                })
            }
        }



        const chartConfig = {
            'type': 'line',
            'data': {
                'datasets': [],
                'labels': []
            },
            'options': {
                'layout': {
                    'padding': {
                        'right': 1
                    }
                },
                'elements': {
                    'point':{
                        'radius': 0
                    }
                },
                'legend': {
                    'display': false,
                    'labels': {
                        'fontSize': 14,
                        'fontColor': 'rgb(255,255,255)'
                    }
                },
                'title': {
                    'display': false
                },
                'animation': {
                    'duration': 0
                },
                'hover': {
                    'animationDuration': 0
                },
                'responsiveAnimationDuration': 0,
                'scales': {
                    'xAxes': [
                        {
                            'drawTicks': false,
                            'color': 'rgba(255, 255, 255, 0)'
                        }
                    ],
                    'yAxes': [
                        {
                            'id': 'temp',
                            'type': 'linear',
                            'position': 'left',
                            'color': 'rgba(255, 255, 255, 0)',
                            'ticks': {
                                'min': 0,
                                'stepSize': 0.5,
                                'fontSize': 20,
                                'maxTicksLimit': 12
                            },
                            'scaleLabel': {
                                'fontSize': 20,
                                'display': true,
                                'labelString': this.locale.graph.temp_history.temperature
                            }
                        }
                    ]
                }
            }
        }

        if(typeof tempHistoryRequest.error !== 'undefined') {
            return
        }

        for(const rawTempSensor in tempHistoryRequest.result) {
            const tempSensor = rawTempSensor.replace(/(temperature_sensor )|(temperature_fan )|(heater_generic )/g, '')

            if(typeof sensor !== 'undefined' && tempSensor !== sensor) { continue }

            const tempValues = this.getTempValues(tempHistoryRequest.result[rawTempSensor].temperatures)
            const tempTargets = this.getTempValues(tempHistoryRequest.result[rawTempSensor].targets)
            const tempPowers =  this.getTempValues(tempHistoryRequest.result[rawTempSensor].powers)

            chartConfig.data.datasets.push({
                'label': tempSensor,
                'borderColor': this.tempCache.colors[rawTempSensor].color,
                'fill': false,
                'data': tempValues,
                'yAxisID': 'temp'
            })

            if(typeof sensor !== 'undefined') {
                chartConfig.options.legend.display = true

                chartConfig.options.scales.yAxes.push({
                    'id': 'power',
                    'color': 'rgba(255, 255, 255, 0)',
                    'type': 'linear',
                    'position': 'right',
                    'ticks': {
                        // @ts-ignore
                        'max': 100,
                        'min': 0,
                        'fontSize': 20
                    },
                    'scaleLabel': {
                        'fontSize': 20,
                        'display': true,
                        'labelString': this.locale.graph.temp_history.power
                    }
                })

                const parsedTempPowers = []

                for(let i = 0; i < tempPowers.length; i++) {
                    parsedTempPowers.push(tempPowers[i] * 100)
                }

                chartConfig.data.datasets.push({
                    'label': `${tempSensor}_power`,
                    'lineStyle': {
                        'type': 'dashed'
                    },
                    'borderColor': this.tempCache.colors[rawTempSensor].color,
                    'backgroundColor': 'rgba(0,0,0,0)',
                    'data': parsedTempPowers,
                    'borderDash': [5,10],
                    'yAxisID': 'power'
                })
            }

            chartConfig.data.datasets.push({
                'label': `${tempSensor}_target`,
                'backgroundColor': this.tempCache.colors[rawTempSensor].color+'35',
                'borderColor': this.tempCache.colors[rawTempSensor].color+'00',
                'data': tempTargets,
                'yAxisID': 'temp'
            })
        }

        for(let i = 0; i < this.tempValueLimit; i++) {
           chartConfig.data.labels.push('')
        }

        const chart = await this.renderChart(chartConfig, 800, 400, 'temp')

        if(typeof chart === 'undefined') {
            return
        }

        return chart
    }

    private async renderChart(chartConfig, width: number, height: number, chartName: string) {
        logRegular(`Render the Chart for ${chartName}...`)
        const quickChart = new QuickChart()

        quickChart
            .setConfig(chartConfig)
            .setHeight(height)
            .setWidth(width)
            .setBackgroundColor('#000000')

        const url = await quickChart.getShortUrl()

        await sleep(500)

        return url
    }

    private getTempValues(tempValues: []) {
        if(typeof tempValues === 'undefined') {
            return []
        }

        if(tempValues.length < this.tempValueLimit) {
            return tempValues
        }

        const limitStart = tempValues.length - this.tempValueLimit

        return tempValues.slice(limitStart)
    }

    private convertToCoords(values: [], width: number, max: number, resHeight = 400, resWidth = 600) {
        const coords = []
        const widthSegment = (100 * resWidth) / width
        console.log(widthSegment)
        console.log(width)
        console.log(resWidth)
        let widthIndex = 0

        if(values === undefined) { return }

        for(const value of values) {
            widthIndex++
        }


        return coords
    }
}