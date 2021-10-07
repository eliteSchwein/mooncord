import * as fs from "fs";
import * as path from "path";
import {logSuccess} from "../helper/ConsoleLogger";
import * as util from "util";
import {LocaleHelper} from "../helper/LocaleHelper";

const cacheData:any = {}
const writeFile = util.promisify(fs.writeFile)
const localeHelper = new LocaleHelper()
const locale = localeHelper.getLocale()

export function setData(key:string, value:any) {
    cacheData[key] = value
}

export function getEntry(key:string) {
    return cacheData[key]
}

export function dump() {
    void writeDump()
    return cacheData
}

async function writeDump() {
    await writeFile(path.resolve(__dirname, '../temp/dump.json'), JSON.stringify(cacheData, null, 4), { encoding: 'utf8', flag: 'w+' })
    logSuccess('Dumped Cache!')
}