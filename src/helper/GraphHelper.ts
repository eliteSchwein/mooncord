import * as quickChart from 'quickchart-js';
import * as App from '../Application';
import path from 'path';
import {ConfigHelper} from './ConfigHelper';
import {MessageAttachment} from 'discord.js';
import axios from 'axios';
import {LocaleHelper} from './LocaleHelper';
import {ChartUtil} from '../utils/ChartUtil';
import {findValue} from '../utils/CacheUtil';

export class GraphHelper {
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected chartUtil = new ChartUtil()
    protected locale = this.localeHelper.getLocale()
    protected tempValueLimit = 0
    protected colorIndex = 0

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

        const chart = await this.chartUtil.getChart(chartConfig, 800, 600)

        return new MessageAttachment(chart, 'meshGraph.png')
    }

    public async getTempGraph() {
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
            const tempValues = this.getTempValues(tempHistoryRequest.result[rawTempSensor].temperatures)

            chartConfig.legend.data.push(tempSensor)

            chartConfig.series.push({
                'name': tempSensor,
                'type': 'line',
                'color': chartConfigSection.colors[this.colorIndex],
                'backgroundColor': chartConfigSection.colors[this.colorIndex],
                'data': tempValues
            })

            this.colorIndex++
        }

        for(let i = 0; i < this.tempValueLimit; i++) {
            chartConfig.xAxis.data.push('')
        }

        const chart = await this.chartUtil.getChart(chartConfig, 800, 400)

        return new MessageAttachment(chart, 'tempGraph.png')
    }

    private getTempValues(tempValues: []) {
        if(tempValues.length < this.tempValueLimit) {
            return tempValues
        }

        const limitStart = tempValues.length - this.tempValueLimit

        return tempValues.slice(limitStart)
    }
}