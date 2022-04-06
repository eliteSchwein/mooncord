import {readFileSync} from "fs";
import {sleep} from "../helper/DataHelper";
import {getBrowser} from "../Application";

export class ChartUtil {
    protected browserClient = getBrowser()

    public async getChart(chartOptions: any, width: number, height: number) {
        let template = readFileSync(`${__dirname}/../src/meta/chartTemplate.html`, 'utf8').toString()

        const page = await this.browserClient.addPage()

        chartOptions.animation = false

        await page.setViewport({
            width,
            height
        })

        template = template
            .replace(/(\${echartOptions})/g, JSON.stringify(chartOptions))

        await page.setContent(template)

        await sleep(250)

        const screenShot = await page.screenshot()

        await page.close()

        return screenShot
    }
}