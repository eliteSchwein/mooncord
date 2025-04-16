'use strict'

import {HistoryHelper} from "../HistoryHelper";
import {logRegular} from "../LoggerHelper";
import SvgHelper from "../SvgHelper";
import {getIcons} from "../DataHelper";
import BaseGraph from "./BaseGraph";

export default class HistoryGraph extends BaseGraph{
    filename = 'historyGraph.png'

    public async renderGraph(printStats = new HistoryHelper().getPrintStats()) {
        const icons = getIcons()
        const svgHelper = new SvgHelper()
        const graphData = []

        logRegular('render history graph...')

        for (const printStat in printStats.stats) {
            graphData.push({
                label: printStat,
                value: printStats.stats[printStat],
                color: '#' + icons[printStat].color
            })
        }

        const resWidth = 300
        const resHeight = 300

        const donutData = svgHelper.calculateDonut(150, 150, 125, 45, graphData)

        let svg = `<svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 ${resWidth} ${resHeight}">
        `


        for (const donutPartial of donutData) {
            svg = `${svg}
                ${donutPartial}
            `
        }

        svg = `
            ${svg}
            </svg>
        `

        return await this.convertSvg(svg)
    }
}