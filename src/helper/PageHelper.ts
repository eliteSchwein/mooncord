import {ConfigHelper} from "./ConfigHelper";
import {LocaleHelper} from "./LocaleHelper";
import {parsePageData} from "./DataHelper";

export class PageHelper {
    protected data: []
    protected pageLocale: any
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    
    public constructor(pageData: [], pageId: string) {
        this.data = pageData
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
             i <= max + (page * max) + page;
             i++) {
            const entry = this.data[i]
            rawEntries.push(entry)
            const label = parsePageData(this.pageLocale.entry_label, entry)

            entries = `${entries}${label}\n`
        }
        return { 'entries': entries, 'raw_entries': rawEntries }
    }

    protected getLastPage() {
        return Math.floor(this.data.length / this.configHelper.getEntriesPerPage())
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
}