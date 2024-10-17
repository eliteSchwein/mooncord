'use strict'

import {ConfigHelper} from "./ConfigHelper";
import {LocaleHelper} from "./LocaleHelper";
import {parsePageData} from "./DataHelper";
import {getConfigFiles, getEntry} from "../utils/CacheUtil";

export class PageHelper {
    protected config = new ConfigHelper()
    protected data: []
    protected embeds = []
    protected pageLocale: any

    public constructor(pageId: string) {
        const embedData = this.config.getEntriesByFilter(new RegExp(`^embed ${pageId}`, 'g'))[0]

        if(embedData && embedData.page_embed_entries) {
            this.embeds = embedData.page_embed_entries
        }

        this.data = this.getValuesForPageId(pageId)
        this.pageLocale = new LocaleHelper().getLocale().pages[pageId]
    }

    public getPage(pageUp: boolean, currentPage: number) {
        if (this.getEntries(0).entries === '') {
            return {}
        }
        const page = this.getNewPage(pageUp, currentPage)
        const entries = this.getEntries(page.calcPage)

        return {
            'page_entries_count': entries.raw_entries.length,
            'page_entries': entries.entries,
            'pages': `${page.labelPage}/${this.getLastPage()}`,
            'raw_entries': entries.raw_entries
        }
    }

    protected getEntries(page: number) {
        console.log(this.data)
        let entries = ''
        const max = new ConfigHelper().getEntriesPerPage() - 1
        const rawEntries = []
        for (let i = (page * max) + page;
             i <= Math.min(this.data.length - 1, max + (page * max) + page);
             i++) {
            const entry = this.data[i]
            rawEntries.push(entry)
            const label = parsePageData(this.pageLocale.entry_label, entry)

            entries = `${entries}${label}\n`
        }
        return {'entries': entries, 'raw_entries': rawEntries}
    }

    protected getLastPage() {
        return Math.ceil(this.data.length / new ConfigHelper().getEntriesPerPage())
    }

    protected getNewPage(pageUp: boolean, currentPage: number) {
        const lastPage = this.getLastPage()
        let page = currentPage - 1

        if (pageUp) {
            page++
            if(page === lastPage) {
                page = 0
            }
        } else if (page !== 0) {
            page--
        } else {
            page = lastPage - 1
        }

        return {calcPage: page, labelPage: (page + 1)}
    }

    protected getValuesForPageId(pageId: string) {
        const cacheEntry = getEntry(pageId)

        if (cacheEntry !== undefined && cacheEntry !== null) {
            return cacheEntry
        }

        return []
    }
}
