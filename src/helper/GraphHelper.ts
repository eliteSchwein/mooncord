import * as App from '../Application';
import path from 'path';
import {ConfigHelper} from './ConfigHelper';
import {MessageAttachment} from 'discord.js';
import axios from 'axios';
import {LocaleHelper} from './LocaleHelper';
import {ChartUtil} from '../utils/ChartUtil';
import {findValue, getEntry} from '../utils/CacheUtil';
import {logError, logRegular} from './LoggerHelper';

export class GraphHelper {
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected chartUtil = new ChartUtil()
    protected locale = this.localeHelper.getLocale()
    protected tempValueLimit = 0
    protected colorIndex = 0
    protected functionCache = getEntry('function')

    public async getMeshGraph(mesh) {
        const meshCache = findValue('state.bed_mesh')
        const maxRow = mesh.map((row) => { return Math.max.apply(Math, row) })
        const minRow = mesh.map((row) => { return Math.min.apply(Math, row) })
        const axisMinimum = findValue('state.toolhead.axis_minimum')
        const axisMaximum = findValue('state.toolhead.axis_maximum')
        const meshHeight = Math.max.apply(null, maxRow).toFixed(1)

        const chartConfig = {
            'tooltip': {
                'show': false
            },
            'darkMode': true,
            'backgroundColor': 'rgb(0,0,0)',
            'visualMap': {
                'show': false,
                'dimension': 2,
                'min': Math.min.apply(null, minRow),
                'max': Math.max.apply(null, maxRow),
                'inRange': {
                    'color': [
                        '#313695',
                        '#4575b4',
                        '#74add1',
                        '#abd9e9',
                        '#e0f3f8',
                        '#ffffbf',
                        '#fee090',
                        '#fdae61',
                        '#f46d43',
                        '#d73027',
                        '#a50026',
                    ],
                },
            },
            'xAxis3D': {
                'type': 'value',
                'min': axisMinimum[0],
                'max': axisMaximum[0],
                'minInterval': 1,
                'axisLabel': {
                    'color':'rgb(255,255,255)',
                    'fontSize': '20px'
                }
            },
            'yAxis3D': {
                'type': 'value',
                'min': axisMinimum[1],
                'max': axisMaximum[1],
                'axisLabel': {
                    'color':'rgb(255,255,255)',
                    'fontSize': '20px'
                }
            },
            'zAxis3D': {
                'type': 'value',
                'min': meshHeight * -1,
                'max': meshHeight,
                'axisLabel': {
                    'color':'rgb(255,255,255)',
                    'fontSize': '20px'
                }
            },
            'grid3D': {
                'viewControl': {
                    'distance': 220,
                    'alpha': 20,
                    'beta': -45
                }
            },
            'series': []
        }


        const xCount = mesh[0].length
        const yCount = mesh.length
        const xMin = meshCache.mesh_min[0]
        const xMax = meshCache.mesh_max[1]
        const yMin = meshCache.mesh_min[0]
        const yMax = meshCache.mesh_max[1]
        const xStep = (xMax - xMin) / (xCount - 1)
        const yStep = (yMax - yMin) / (yCount - 1)

        const data: any[] = []

        let yPoint = 0

        mesh.forEach((meshRow: number[]) => {
            let xPoint = 0
            meshRow.forEach((value: number) => {
                data.push([xMin + xStep * xPoint, yMin + yStep * yPoint, value])
                xPoint++
            })
            yPoint++
        })

        const series = {
            'type': 'surface',
            'name': 'mesh',
            'data': data,
            'dataShape': [yCount, xCount]
        }

        chartConfig.series.push(series)

        const chart = await this.renderChart(chartConfig, 800, 600, 'mesh')

        if(typeof chart === 'undefined') {
            return
        }

        return new MessageAttachment(chart, 'meshGraph.png')
    }

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
            'darkMode': true,
            'backgroundColor': 'rgb(0,0,0)',
            'title': {
                'text':this.locale.graph.temp_history.title
            },
            'legend': {
                'data': [],
                'textStyle': {
                    'color': 'rgb(255,255,255)',
                    'fontSize': '20px'
                },
                'icon': 'pin'
            },
            'type': 'line',
            'xAxis': {
                'type': 'category',
                'data': [],
                'splitLine': {
                    'show': true,
                    'lineStyle': {
                        'color': 'rgba(255, 255, 255, 0)',
                    },
                },
                'axisTick': {
                    'show': false
                },
                'axisLabel':{
                    'show':false
                }
            },
            'yAxis': [
                {
                    'type': 'value',
                    'min': 0,
                    'splitLine': {
                        'show': true,
                        'lineStyle': {
                            'color': 'rgba(255, 255, 255, 0.26)',
                        },
                    },
                    'axisLabel': {
                        'color': 'rgba(255,255,255,0.78)',
                        'fontSize': '20px'
                    },
                    'minInterval': 20,
                    'maxInterval': 100
                }
            ],
            'series': [],
            'media': [
                {
                    'query': {
                        'minWidth': 500,
                    },
                    'option': {
                        'grid': {
                            'right': 15,
                            'left': 50,
                            'bottom': 15
                        },
                        'yAxis': [
                            {
                                'maxInterval': 50,
                                'axisLabel': {
                                    'showMinLabel': true,
                                    'showMaxLabel': true,
                                    'rotate': 0,
                                },
                            }
                        ],
                    },
                },
            ],
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

            chartConfig.legend.data.push(tempSensor)

            chartConfig.series.push({
                'name': tempSensor,
                'type': 'line',
                'color': chartConfigSection.colors[this.colorIndex],
                'data': tempValues
            })

            if(typeof sensor !== 'undefined') {
                chartConfig.legend.data.push({
                    'name':`${tempSensor}_power`,
                    'itemStyle':{
                        'color':{
                            'type':'linear',
                            'x':0,
                            'y':0,
                            'x2':1,
                            'y2':0,
                            'colorStops':[
                                {
                                    'offset':0,
                                    'color':chartConfigSection.colors[this.colorIndex]
                                },
                                {
                                    'offset':0.15,
                                    'color':'black'
                                },
                                {
                                    'offset':0.25,
                                    'color':chartConfigSection.colors[this.colorIndex]
                                },
                                {
                                    'offset':0.45,
                                    'color':'black'
                                },
                                {
                                    'offset':0.5,
                                    'color':chartConfigSection.colors[this.colorIndex]
                                },
                                {
                                    'offset':0.65,
                                    'color':'black'
                                },
                                {
                                    'offset':0.75,
                                    'color':chartConfigSection.colors[this.colorIndex]
                                },
                                {
                                    'offset':1,
                                    'color':'black'
                                }
                            ],
                            'global':false
                        }
                    }
                })

                chartConfig.series.push({
                    'name': `${tempSensor}_power`,
                    'type': 'line',
                    'lineStyle': {
                        'type': 'dashed'
                    },
                    'color': chartConfigSection.colors[this.colorIndex],
                    'data': tempPowers
                })
            }

            chartConfig.series.push({
                'name': `${tempSensor}_target`,
                'type': 'line',
                'lineStyle': {
                    'width': 0
                },
                'areaStyle': {
                    'color': chartConfigSection.colors[this.colorIndex],
                    'opacity': 0.2
                },
                'emphasis': {
                    'areaStyle': {
                        'color': chartConfigSection.colors[this.colorIndex],
                        'opacity': 0.2
                    },
                    'lineStyle': {
                        'width': 0
                    }
                },
                'color': chartConfigSection.colors[this.colorIndex],
                'data': tempTargets
            })

            this.colorIndex++
        }

        for(let i = 0; i < this.tempValueLimit; i++) {
            chartConfig.xAxis.data.push('')
        }

        const chart = await this.renderChart(chartConfig, 800, 400, 'temp')

        if(typeof chart === 'undefined') {
            return
        }

        return new MessageAttachment(chart, 'tempGraph.png')
    }

    private async renderChart(chartConfig, width: number, height: number, chartName: string) {
        const service = this.configHelper.getGraphService()

        if(service === 'internal') {
            logRegular(`Render the Chart for ${chartName} internal...`)
            return this.chartUtil.getChart(chartConfig, width, height)
        }

        logRegular(`Render the Chart for ${chartName} with ${service}...`)
        try {
            const serviceRequest = await axios({
                method: 'post',
                url: service,
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    'resolution': {
                        width, height
                    },
                    'chart_options': chartConfig
                }
            })

            return Buffer.from(serviceRequest.data, 'binary')
        } catch (error) {
            logError(error)
        }
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