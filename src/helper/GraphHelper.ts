import * as quickChart from 'quickchart-js';
import * as App from "../Application";
import path from "path";
import {ConfigHelper} from "./ConfigHelper";
import {MessageAttachment} from "discord.js";
import QuickChart from "quickchart-js";
import axios from "axios";
import {LocaleHelper} from "./LocaleHelper";

export class GraphHelper {
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected tempValueLimit = 0
    protected colorIndex = 0

    public async getTempGraph() {
        const moonrakerClient = App.getMoonrakerClient()
        const chart = new QuickChart()
        const chartConfigSection = this.configHelper.getGraphConfig('temp_history')

        this.tempValueLimit = chartConfigSection.value_limit

        const tempHistoryRequest = await moonrakerClient.send({"method": "server.temperature_store"})

        const chartConfig = {
            'type': 'line',
            'data': {
                'labels': [],
                'datasets': []
            },
            'options': {
                'title': {
                    'display': true,
                    'text': this.locale.graph.temp_history.title
                }
            }
        }

        if(typeof tempHistoryRequest.error !== 'undefined') {
            return
        }

        for(const rawTempSensor in tempHistoryRequest.result) {
            const tempSensor = rawTempSensor.replace(/(temperature_sensor )|(temperature_fan )|(heater_generic )/g, '')
            const tempValues = this.getTempValues(tempHistoryRequest.result[rawTempSensor].temperatures)

            chartConfig.data.datasets.push({
                'label': tempSensor,
                'fill': false,
                'backgroundColor': chartConfigSection.colors[this.colorIndex],
                'borderColor': chartConfigSection.colors[this.colorIndex],
                'data': tempValues
            })

            this.colorIndex++
        }

        for(let i = 0; i < this.tempValueLimit; i++) {
            chartConfig.data.labels.push('')
        }

        chart
            .setConfig(chartConfig)
            .setWidth(800)
            .setHeight(400)

        const webRequest = await axios.get(chart.getUrl(), {
            responseType: 'arraybuffer'
        })

        return new MessageAttachment(Buffer.from(webRequest.data, 'base64'), 'tempGraph.png')
    }

    private getTempValues(tempValues: []) {
        if(tempValues.length < this.tempValueLimit) {
            return tempValues.map((value: number) => {
                return Math.round(value);
            })
        }

        const limitStart = tempValues.length - this.tempValueLimit

        return tempValues.slice(limitStart).map((value: number) => {
            return Math.round(value);
        })
    }
}