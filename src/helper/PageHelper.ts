import {ConfigHelper} from "./ConfigHelper";
import {LocaleHelper} from "./LocaleHelper";
import {parsePageData} from "./DataHelper";
import {getConfigFiles, getEntry} from "../utils/CacheUtil";

export class PageHelper {
    protected data: []
    protected pageLocale: any
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    
    public constructor(pageId: string) {
        this.data = this.getValuesForPageId(pageId)
        this.pageLocale = this.locale.pages[pageId]
    }

    public getPage(pageUp: boolean, currentPage: number) {
        const page = this.getNewPage(pageUp, currentPage)
        const entries = this.getEntries(page.calcPage)

        return {
            'page_entries': entries.entries,
            'pages': `${page.labelPage}/${this.getLastPage()}`,
            'raw_entries': entries.raw_entries
        }
    }

    protected getEntries(page: number) {
        let entries = ''
        const max = this.configHelper.getEntriesPerPage() - 1
        const rawEntries = []
        for (let i = (page * max) + page;
             i <= Math.min(this.data.length - 1, max + (page * max) + page);
             i++) {
            const entry = this.data[i]
            rawEntries.push(entry)
            const label = parsePageData(this.pageLocale.entry_label, entry)

            entries = `${entries}${label}\n`
        }
        return { 'entries': entries, 'raw_entries': rawEntries }
    }

    protected getLastPage() {
        console.log(this.data)
        return Math.ceil(this.data.length / this.configHelper.getEntriesPerPage())
    }

    protected getNewPage(pageUp: boolean, currentPage: number) {
        const lastPage = this.getLastPage()
        let page = currentPage - 1

        if(pageUp) {
            if(page !== lastPage -1) {
                page++
            }
        } else if(page !== 0) {
            page--
        }

        return {calcPage: page, labelPage: (page + 1)}
    }

    protected getValuesForPageId(pageId: string) {
        if(pageId === 'gcodes_files') {
            return getEntry('gcode_files')
        }

        if(pageId === 'configs_download')  {
            return getConfigFiles()
        }
    }
}
