import {readFileSync} from "fs";
import Puppeteer from 'puppeteer'
import {sleep} from "../helper/DataHelper";

export class ChartUtil {
    public async getChart(chartOptions: any, width: number, height: number) {
        let template = readFileSync(`${__dirname}/../src/meta/chartTemplate.html`, 'utf8').toString()
        const browser = await Puppeteer.launch({defaultViewport: null})
        const page = await browser.newPage()

        chartOptions.animation = false

        await page.setViewport({
            width,
            height
        })

        template = template
            .replace(/(\${echartOptions})/g, JSON.stringify(chartOptions))

        await page.setContent(template)

        await sleep(500)

        const screenShot = await page.screenshot()

        await browser.close()

        return screenShot
    }
}