'use strict'

import {ConfigHelper} from "../ConfigHelper";
import * as metaData from "../../meta/history_graph_meta.json"
import {HistoryHelper} from "../HistoryHelper";
import {LocaleHelper} from "../LocaleHelper";
import {logRegular} from "../LoggerHelper";
import sharp from "sharp";
import {AttachmentBuilder} from "discord.js";
import SvgHelper from "../SvgHelper";

export default class HistoryGraph {
    public getIcons() {
        const configHelper = new ConfigHelper()
        const icons:any = {}

        for(const iconKey of metaData.icons) {
            const iconData = configHelper.getIcons(new RegExp(`${iconKey}`, 'g'))

            if(iconData.length === 0) {
                continue
            }

            icons[iconKey] = iconData[0]
        }

        return icons
    }

    public async renderGraph() {
        const printStats = new HistoryHelper().getPrintStats()
        const icons = this.getIcons()
        const svgHelper = new SvgHelper()
        const graphData = []

        logRegular('render history graph...')

        for (const printStat in printStats.stats) {
            graphData.push({
                label: printStat,
                value: printStats.stats[printStat],
                color: '#'+icons[printStat].color
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

        const graphBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
        return new AttachmentBuilder(graphBuffer, {name: 'historyGraph.png'})
    }
}