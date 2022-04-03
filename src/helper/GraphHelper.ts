import * as quickChart from 'quickchart-js';
import * as App from '../Application';
import path from 'path';
import {ConfigHelper} from './ConfigHelper';
import {MessageAttachment} from 'discord.js';
import axios from 'axios';
import {LocaleHelper} from './LocaleHelper';
import {ChartUtil} from '../utils/ChartUtil';

export class GraphHelper {
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected chartUtil = new ChartUtil()
    protected locale = this.localeHelper.getLocale()
    protected tempValueLimit = 0
    protected colorIndex = 0

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