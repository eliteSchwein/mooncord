import type {Browser} from 'puppeteer';
import Puppeteer from 'puppeteer'
import {logRegular} from "../helper/LoggerHelper";

export class BrowserClient {
    protected browser: Browser

    public async initBrowser() {
        logRegular('init Browser Client...')
        this.browser = await Puppeteer.launch({
            defaultViewport: null,
            args: ['--no-sandbox', '--incognito'],
            headless: true
        })
    }

    public async addPage() {
        return await this.browser.newPage()
    }

    public async closeBrowser() {
        await this.browser.close()
    }
}