'use strict'

import {ConfigHelper} from "./ConfigHelper";
import {LocaleHelper} from "./LocaleHelper";
import {parsePageData} from "./DataHelper";
import {findValue} from "../utils/CacheUtil";
import {EmbedHelper} from "./EmbedHelper";
import {TemplateHelper} from "./TemplateHelper";

export class PageHelper {
    protected config = new ConfigHelper()
    protected template = new TemplateHelper()
    protected data: []
    protected embedId: string
    protected embeds = []
    protected cacheKey: string|undefined = undefined
    protected pageLocale: any

    public constructor(pageId: string) {
        const embedData = this.config.getEntriesByFilter(new RegExp(`^embed ${pageId}`, 'g'))[0]

        if(embedData && embedData.page_embed_entries) {
            this.embeds = embedData.page_embed_entries
        }
        if(embedData && embedData.page_cache_key) {
            this.cacheKey = embedData.page_cache_key
        }

        this.data = this.getValuesForPageId(pageId)
        this.pageLocale = new LocaleHelper().getLocale().pages[pageId]
        this.embedId = pageId
    }

    public async getPage(pageUp: boolean, currentPage: number) {
        const page = this.getNewPage(pageUp, currentPage)
        if(this.embeds.length > 0 && page.calcPage < this.embeds.length) {
            const embedId = this.embeds[page.calcPage]
            const embed = await (new EmbedHelper()).generateEmbed(embedId, {pages: `${page.labelPage}/${this.getLastPage()}`})

            return {
                embed: embed.embed,
                pages: `${page.labelPage}/${this.getLastPage()}`,
            }
        }
        console.log(this.getEntries(0))
        if (this.getEntries(0).entries === '') {
            return null
        }
        const calcPage = page.calcPage - this.embeds.length
        const entries = this.getEntries(calcPage)

        const embed = await (new EmbedHelper()).generateEmbed(this.embedId, {
            page_entries_count: entries.raw_entries.length,
            page_entries: entries.entries,
            pages: `${page.labelPage}/${this.getLastPage()}`,
            raw_entries: entries.raw_entries
        })

        return {
            embed: embed.embed,
            pages: `${page.labelPage}/${this.getLastPage()}`,
        }
    }

    protected getEntries(page: number) {
        let entries = ''
        const max = this.config.getEntriesPerPage() - 1
        const rawEntries = []
        for (let i = (page * max) + page;
             i <= Math.min(this.data.length - 1, max + (page * max) + page);
             i++) {
            const entry = this.data[i]
            rawEntries.push(entry)
            let label = parsePageData(this.pageLocale.entry_label, entry)
            label = this.template.parsePlaceholder(label, {data: entry})
            entries = `${entries}${label}\n`
        }
        return {'entries': entries, 'raw_entries': rawEntries}
    }

    protected getLastPage() {
        return Math.ceil(this.data.length / new ConfigHelper().getEntriesPerPage()) + this.embeds.length
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
        const cacheEntry = findValue((this.cacheKey) ? this.cacheKey : pageId)

        if (cacheEntry !== undefined && cacheEntry !== null) {
            return cacheEntry
        }

        return []
    }
}
