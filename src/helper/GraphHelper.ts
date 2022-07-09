import * as App from '../Application';
import {ConfigHelper} from './ConfigHelper';
import {LocaleHelper} from './LocaleHelper';
import {getEntry} from '../utils/CacheUtil';
import {logRegular} from './LoggerHelper';
import QuickChart from "quickchart-js";
import {sleep} from "./DataHelper";

export class GraphHelper {
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected tempValueLimit = 0
    protected colorIndex = 0
    protected functionCache = getEntry('function')

    public async getTempGraph(sensor = undefined) {
        if(!this.configHelper.isGraphEnabled()) {
            return
        }

        if(!this.configHelper.isGraphEnabledWhilePrinting() && this.functionCache.current_status === 'printing') {
            return
        }

        const moonrakerClient = App.getMoonrakerClient()
        const chartConfigSection = this.configHelper.getGraphConfig('temp_history')

        this.tempValueLimit = chartConfigSection.value_limit

        const tempHistoryRequest = await moonrakerClient.send({'method': 'server.temperature_store'})

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
                    'display': true,
                    'labels': {
                        'fontSize': 14,
                        'fontColor': 'rgb(255,255,255)'
                    }
                },
                'title': {
                    'text':this.locale.graph.temp_history.title,
                    'display': true
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
                                'stepSize': 0.5,
                                'fontSize': 15,
                                'maxTicksLimit': 12
                            },
                            'scaleLabel': {
                                'fontSize': 15,
                                'display': true,
                                'labelString': 'Temp'
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
                'borderColor': chartConfigSection.colors[this.colorIndex],
                'fill': false,
                'data': tempValues,
                'yAxisID': 'temp'
            })

            if(typeof sensor !== 'undefined') {
                chartConfig.options.scales.yAxes.push({
                    'id': 'power',
                    'color': 'rgba(255, 255, 255, 0)',
                    'type': 'linear',
                    'position': 'right',
                    'ticks': {
                        // @ts-ignore
                        'max': 100,
                        'min': 0,
                        'fontSize': 15
                    },
                    'scaleLabel': {
                        'fontSize': 15,
                        'display': true,
                        'labelString': 'Power'
                    }
                })

                chartConfig.data.datasets.push({
                    'label': `${tempSensor}_power`,
                    'lineStyle': {
                        'type': 'dashed'
                    },
                    'borderColor': chartConfigSection.colors[this.colorIndex],
                    'backgroundColor': 'rgba(0,0,0,0)',
                    'data': tempPowers,
                    'borderDash': [5,10],
                    'yAxisID': 'power'
                })
            }

            chartConfig.data.datasets.push({
                'label': `${tempSensor}_target`,
                'backgroundColor': chartConfigSection.colors[this.colorIndex]+'35',
                'borderColor': chartConfigSection.colors[this.colorIndex]+'00',
                'data': tempTargets,
                'yAxisID': 'temp'
            })

            this.colorIndex++
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

        await sleep(1000)

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
}